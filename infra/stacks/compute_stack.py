from aws_cdk import Stack, Duration, RemovalPolicy, SecretValue, aws_ec2 as ec2, aws_ecs as ecs, aws_ecr as ecr, aws_rds as rds, aws_elasticloadbalancingv2 as elbv2, aws_logs as logs, aws_secretsmanager as secretsmanager, CfnOutput
from constructs import Construct


class ComputeStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, vpc: ec2.Vpc, ecs_security_group: ec2.SecurityGroup, alb_security_group: ec2.SecurityGroup, database: rds.DatabaseInstance, db_secret: secretsmanager.Secret, backend_repo: ecr.Repository, frontend_repo: ecr.Repository, payments_provider_url: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        password_pepper_secret = secretsmanager.Secret(
            self, "PasswordPepperSecret",
            secret_name="store/auth-password-pepper",
            generate_secret_string=secretsmanager.SecretStringGenerator(
                exclude_punctuation=True,
                password_length=48
            ),
            removal_policy=RemovalPolicy.DESTROY,
        )

        payments_secret = secretsmanager.Secret(
            self, "PaymentsSecret",
            secret_name="store/payments",
            secret_object_value={
                "api_key": SecretValue.unsafe_plain_text("replace-me"),
                "sign_phrase": SecretValue.unsafe_plain_text("replace-me"),
            },
            removal_policy=RemovalPolicy.DESTROY,
        )

        cluster = ecs.Cluster(self, "Cluster", vpc=vpc,
                              container_insights=True)

        backend_task = ecs.FargateTaskDefinition(
            self, "BackendTask", memory_limit_mib=4096, cpu=1024)

        db_secret.grant_read(backend_task.task_role)
        password_pepper_secret.grant_read(backend_task.task_role)
        payments_secret.grant_read(backend_task.task_role)

        if backend_task.execution_role is not None:
            db_secret.grant_read(backend_task.execution_role)
            password_pepper_secret.grant_read(backend_task.execution_role)
            payments_secret.grant_read(backend_task.execution_role)

        backend_task.add_container(
            "Backend",
            image=ecs.ContainerImage.from_ecr_repository(
                backend_repo, tag="latest"),
            environment={
                "DB_SQL_SETTINGS__HOST": database.db_instance_endpoint_address,
                "DB_SQL_SETTINGS__PORT": "5432",
                "DB_SQL_SETTINGS__DATABASE": "store_db",
                "VECTOR_STORE_SETTINGS__CHROMA_HOST": "chroma",
                "VECTOR_STORE_SETTINGS__CHROMA_PORT": "8000",
                "VECTOR_STORE_SETTINGS__CHROMA_ANONYMIZED_TELEMETRY": "false",
                "PAYMENTS_SETTINGS__PROVIDER_URL": payments_provider_url,
            },
            secrets={
                "AUTH_SETTINGS__PASSWORD_PEPPER": ecs.Secret.from_secrets_manager(password_pepper_secret),
                "DB_SQL_SETTINGS__USERNAME": ecs.Secret.from_secrets_manager(db_secret, "username"),
                "DB_SQL_SETTINGS__PASSWORD": ecs.Secret.from_secrets_manager(db_secret, "password"),
                "PAYMENTS_SETTINGS__API_KEY": ecs.Secret.from_secrets_manager(payments_secret, "api_key"),
                "PAYMENTS_SETTINGS__SIGN_PHRASE": ecs.Secret.from_secrets_manager(payments_secret, "sign_phrase"),
            },
            logging=ecs.LogDrivers.aws_logs(
                stream_prefix="backend", log_retention=logs.RetentionDays.ONE_WEEK),
            port_mappings=[ecs.PortMapping(
                container_port=8000, protocol=ecs.Protocol.TCP, name="backend")],
        )

        frontend_task = ecs.FargateTaskDefinition(
            self, "FrontendTask", memory_limit_mib=512, cpu=256)
        frontend_task.add_container(
            "Frontend",
            image=ecs.ContainerImage.from_ecr_repository(
                frontend_repo, tag="latest"),
            logging=ecs.LogDrivers.aws_logs(
                stream_prefix="frontend", log_retention=logs.RetentionDays.ONE_WEEK),
            port_mappings=[ecs.PortMapping(
                container_port=8080, protocol=ecs.Protocol.TCP, name="frontend")],
        )

        chroma_task = ecs.FargateTaskDefinition(
            self, "ChromaTask", memory_limit_mib=1024, cpu=512)
        chroma_task.add_container(
            "Chroma",
            image=ecs.ContainerImage.from_registry("chromadb/chroma:latest"),
            environment={
                "IS_PERSISTENT": "FALSE",
                "ANONYMIZED_TELEMETRY": "FALSE",
            },
            logging=ecs.LogDrivers.aws_logs(
                stream_prefix="chroma", log_retention=logs.RetentionDays.ONE_WEEK),
            port_mappings=[ecs.PortMapping(
                container_port=8000, protocol=ecs.Protocol.TCP, name="chroma")],
        )

        backend_service = ecs.FargateService(
            self, "BackendService", cluster=cluster, task_definition=backend_task, desired_count=1,
            security_groups=[ecs_security_group], vpc_subnets=ec2.SubnetSelection(
                subnet_type=ec2.SubnetType.PRIVATE_WITH_EGRESS),
            service_connect_configuration=ecs.ServiceConnectProps(
                namespace="store.local",
                services=[ecs.ServiceConnectService(
                    port_mapping_name="backend",
                    dns_name="backend",
                    port=8000,
                )],
            ),
        )
        frontend_service = ecs.FargateService(
            self, "FrontendService", cluster=cluster, task_definition=frontend_task, desired_count=1,
            security_groups=[ecs_security_group], vpc_subnets=ec2.SubnetSelection(
                subnet_type=ec2.SubnetType.PRIVATE_WITH_EGRESS),
            service_connect_configuration=ecs.ServiceConnectProps(
                namespace="store.local",
            ),
        )
        chroma_service = ecs.FargateService(
            self, "ChromaService", cluster=cluster, task_definition=chroma_task, desired_count=1,
            security_groups=[ecs_security_group], vpc_subnets=ec2.SubnetSelection(
                subnet_type=ec2.SubnetType.PRIVATE_WITH_EGRESS),
            service_connect_configuration=ecs.ServiceConnectProps(
                namespace="store.local",
                services=[ecs.ServiceConnectService(
                    port_mapping_name="chroma",
                    dns_name="chroma",
                    port=8000,
                )],
            ),
        )

        alb = elbv2.ApplicationLoadBalancer(
            self, "ALB", vpc=vpc, internet_facing=True,
            security_group=alb_security_group,
            vpc_subnets=ec2.SubnetSelection(subnet_type=ec2.SubnetType.PUBLIC)
        )

        listener = alb.add_listener("HTTPListener", port=80, open=True)

        listener.add_targets(
            "FrontendTarget", port=8080, targets=[frontend_service],
            health_check=elbv2.HealthCheck(path="/", interval=Duration.seconds(
                30), timeout=Duration.seconds(5), healthy_threshold_count=2, unhealthy_threshold_count=3)
        )

        ecs_security_group.add_ingress_rule(ec2.Peer.security_group_id(
            alb.connections.security_groups[0].security_group_id), ec2.Port.all_tcp(), "ALB")
        database.connections.allow_from(
            ecs_security_group, ec2.Port.tcp(5432), "Backend->RDS")

        self.alb = alb

        CfnOutput(self, "ClusterName", value=cluster.cluster_name)
        CfnOutput(self, "BackendServiceName",
                  value=backend_service.service_name)
        CfnOutput(self, "FrontendServiceName",
                  value=frontend_service.service_name)
        CfnOutput(self, "ChromaServiceName", value=chroma_service.service_name)
        CfnOutput(self, "PaymentsSecretName",
                  value=payments_secret.secret_name)
        CfnOutput(self, "LoadBalancerDNS",
                  value=alb.load_balancer_dns_name)

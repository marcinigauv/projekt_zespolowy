from typing import Any

from aws_cdk import CfnOutput, RemovalPolicy, Stack, aws_ec2 as ec2, aws_elasticache as elasticache
from constructs import Construct


class CacheStack(Stack):
    def __init__(
        self,
        scope: Construct,
        construct_id: str,
        *,
        vpc: ec2.Vpc,
        ecs_security_group: ec2.SecurityGroup,
        **kwargs: Any,
    ) -> None:
        super().__init__(scope, construct_id, **kwargs)

        self.cache_security_group = ec2.SecurityGroup(
            self,
            "CacheSecurityGroup",
            vpc=vpc,
            allow_all_outbound=False,
            description="Security group for AskAI Redis cache",
        )
        self.cache_security_group.add_ingress_rule(
            ecs_security_group,
            ec2.Port.tcp(6379),
            "ECS to Redis",
        )

        subnet_group = elasticache.CfnSubnetGroup(
            self,
            "AskAiRedisSubnetGroup",
            description="Subnet group for AskAI Redis cache",
            subnet_ids=[subnet.subnet_id for subnet in vpc.isolated_subnets],
            cache_subnet_group_name="store-askai-cache-subnets",
        )

        cache_cluster = elasticache.CfnCacheCluster(
            self,
            "AskAiRedisCluster",
            cluster_name="store-askai-cache",
            engine="redis",
            engine_version="7.1",
            cache_node_type="cache.t4g.micro",
            num_cache_nodes=1,
            cache_subnet_group_name=subnet_group.ref,
            vpc_security_group_ids=[
                self.cache_security_group.security_group_id],
            port=6379,
            auto_minor_version_upgrade=True,
        )
        cache_cluster.apply_removal_policy(RemovalPolicy.DESTROY)
        cache_cluster.add_dependency(subnet_group)

        self.redis_host = cache_cluster.attr_redis_endpoint_address
        self.redis_port = cache_cluster.attr_redis_endpoint_port

        CfnOutput(self, "AskAiRedisHost", value=self.redis_host)
        CfnOutput(self, "AskAiRedisPort", value=self.redis_port)
        CfnOutput(self, "AskAiRedisSecurityGroupId",
                  value=self.cache_security_group.security_group_id)

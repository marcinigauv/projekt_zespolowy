from aws_cdk import Stack, aws_ecr as ecr, RemovalPolicy, CfnOutput
from constructs import Construct


class ContainerStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        self.backend_repo = ecr.Repository(
            self, "Backend",
            repository_name="store-backend",
            removal_policy=RemovalPolicy.DESTROY,
            empty_on_delete=True,
            image_scan_on_push=True,
        )

        self.db_initializer_repo = ecr.Repository(
            self, "DbInitializer",
            repository_name="store-db-initializer",
            removal_policy=RemovalPolicy.DESTROY,
            empty_on_delete=True,
            image_scan_on_push=True,
        )

        CfnOutput(self, "BackendRepositoryUri",
                  value=self.backend_repo.repository_uri)
        CfnOutput(self, "DbInitializerRepositoryUri",
                  value=self.db_initializer_repo.repository_uri)

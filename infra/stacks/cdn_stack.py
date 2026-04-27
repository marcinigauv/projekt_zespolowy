from aws_cdk import Stack, Duration, RemovalPolicy, aws_cloudfront as cloudfront, aws_cloudfront_origins as origins, aws_elasticloadbalancingv2 as elbv2, aws_s3 as s3, CfnOutput
from constructs import Construct


class CdnStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, alb: elbv2.ApplicationLoadBalancer, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        frontend_bucket = s3.Bucket(
            self, "FrontendBucket",
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
            enforce_ssl=True,
            auto_delete_objects=True,
            removal_policy=RemovalPolicy.DESTROY,
        )

        frontend_origin = origins.S3BucketOrigin.with_origin_access_control(
            frontend_bucket)
        api_origin = origins.LoadBalancerV2Origin(
            alb,
            protocol_policy=cloudfront.OriginProtocolPolicy.HTTP_ONLY,
            http_port=80,
        )

        api_path_rewrite = cloudfront.Function(
            self, "ApiPathRewrite",
            code=cloudfront.FunctionCode.from_inline("""
function handler(event) {
    var request = event.request;

    if (request.uri.startsWith('/api/')) {
        request.uri = request.uri.substring(4);
    }

    return request;
}
"""),
        )

        self.distribution = cloudfront.Distribution(
            self, "Distribution",
            default_root_object="index.html",
            default_behavior=cloudfront.BehaviorOptions(
                origin=frontend_origin,
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                allowed_methods=cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
                cache_policy=cloudfront.CachePolicy.CACHING_OPTIMIZED,
            ),
            additional_behaviors={
                "/api/*": cloudfront.BehaviorOptions(
                    origin=api_origin,
                    viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    allowed_methods=cloudfront.AllowedMethods.ALLOW_ALL,
                    cache_policy=cloudfront.CachePolicy.CACHING_DISABLED,
                    origin_request_policy=cloudfront.OriginRequestPolicy.ALL_VIEWER,
                    function_associations=[cloudfront.FunctionAssociation(
                        event_type=cloudfront.FunctionEventType.VIEWER_REQUEST,
                        function=api_path_rewrite,
                    )],
                ),
            },
            error_responses=[
                cloudfront.ErrorResponse(
                    http_status=403,
                    response_http_status=200,
                    response_page_path="/index.html",
                    ttl=Duration.seconds(0),
                ),
                cloudfront.ErrorResponse(
                    http_status=404,
                    response_http_status=200,
                    response_page_path="/index.html",
                    ttl=Duration.seconds(0),
                ),
            ],
            price_class=cloudfront.PriceClass.PRICE_CLASS_100,
        )

        CfnOutput(self, "CloudFrontURL",
                  value=f"https://{self.distribution.distribution_domain_name}")
        CfnOutput(self, "CloudFrontDomain",
                  value=self.distribution.distribution_domain_name)
        CfnOutput(self, "CloudFrontDistributionId",
                  value=self.distribution.distribution_id)
        CfnOutput(self, "FrontendBucketName",
                  value=frontend_bucket.bucket_name)

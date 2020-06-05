
deploy:
	aws s3 sync dist/ s3://floweditor.holaemi.com --profile sapiens
	aws cloudfront create-invalidation --profile sapiens --distribution-id E10GG3C8SC0GVX --paths "/example.js"

deploy-new:
	aws s3 sync dist/ s3://flow-editor.emilabs.io
	aws cloudfront create-invalidation --distribution-id E3K1AMYLRD2I6Z

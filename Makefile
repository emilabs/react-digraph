
deploy:
	npm run clean
	npm run build
	aws s3 sync dist/ s3://flow-editor.emilabs.io
	aws cloudfront create-invalidation --distribution-id E3K1AMYLRD2I6Z --paths "/*"

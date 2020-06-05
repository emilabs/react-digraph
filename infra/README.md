# Infra

Manage and provision Emi's infrastructure through code

## Getting started

1. Read our [guidelines in Notion](https://www.notion.so/emilabs/Infra-as-Code-dedf8c9d16ea4e4098d4670a2650e5f1)
1. Install tfenv `brew install tfenv`
1. Install terraform `tfenv install`
1. Run `terraform init` in this directory

## Apply changes

Run `terraform apply`

## Update modules

`terraform get -update`

Modules that are already downloaded will be checked for updates and the updates will be downloaded if present.

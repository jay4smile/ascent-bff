# FS Cloud Architectures

This application backend will enable a collection of APIs that will support the relationship between a 
Reference Architecture and its Bill of Materials(BOM) (list of comprising services). The BOM relationship to 
the list of FS Ready services. The mapping between the cloud services and the FS Controls. Finally you can 
view the FS Controls mapping to the Cloud Services and the supporting refernece Architectures.

Once we have this data model in place, we will be able to link it to the Automation Catalog that is being
built by Asset team,  we will be able to take the BOM and input it into the Solution Builder API they have built
and output a package of consistent terraform.

This will enable the Ecosystem teams including ISVs to have a consistent way of describing reference archtiectures
and having their automation packaged consistently.

This application is generated using [LoopBack 4 CLI](https://loopback.io/doc/en/lb4/Command-line-interface.html) with the
[initial project layout](https://loopback.io/doc/en/lb4/Loopback-application-layout.html).

## Supporting Documentation

List of reference documentation that will support the APIs

- [NIST-800-53](https://nvd.nist.gov/800-53)
- [Cloud Catalog API](https://globalcatalog.cloud.ibm.com/api/v1?_limit=100&complete=false&q=is.volume)
- [Automation Git Repo](https://github.com/ibm-garage-cloud/garage-terraform-modules/blob/main/MODULES.md)
- [Automation Catalog](https://raw.githubusercontent.com/ibm-garage-cloud/garage-terraform-modules/gh-pages/index.yaml)
- [Solution Builder Code]()

## Overview

The Architecture builder's goal is to simplify the complexity of the data attributes that surround a
reference architecture for the FS Cloud. When we review the Financial Controls the number of cloud services
and the possible reference architectures these can be assembled in. It has become clear
a tool will help manage this wide range of attributes.

The following diagram helps describes the key entities and their relationships.

![Data Model](./data/data-model.png)

The following diagram describes our database model in details:

![Database Model](./data/dbdocs/db-specs.png)

## Data

To help speed up the data loading a simple ingestion model has been created. The core
data entities are created in Excel spreadsheets. The first row of the entity holds
the column name or JSON attribute name. To ingest data save the entity in `csv` file 
format. into the `data/source` folder. To then convert the into JSON format
install the following package`

Install the `csvtojson` tool `npm install csvtojson -g`

Then run the script `./convert.sh` this will export the `csv` files into `json` files

### Import to MongoDB

From the `data` folder download the MongoDB certificate into `export DBCERT=~/projects/certs/cloud-mongodb.pem`

From the MongoDB services instance screen in IBM Cloud take the `composed` value and configure
the `URI` environment variable `export URI="mongodb://ibm_cloud_4..`.
For the test database you want to do the same thing with the `URI_TEST` environment variable `export URI_TEST="mongodb://ibm_cloud_4..`.

You can then run `./mload-cloud { $URI | $URI_TEST }` to configure the MongoDB collection with the initial data to 
feed the API.

## Local development

Setup the following environment variables before you can run the application.

To run this locally you need to take the mongo binding value that is registered as a 
secret in the OpenShift environment or from the Service Credentials section of a 
managed MongoDB instance. Take the binding value and configure it as a environment value.

```base
export DATABASE_DEV="{binding....}"
```

The BFF integrates with Cloud Object Storage to read Diagrams and other supporting documentations. Export
a variable for storage

```base
export STORAGE="{binding....}"
```

Once this value is set it is now possible to run the application.

```sh
yarn install
yarn start:dev
```

## Deploy on OpenShift

1. Install [Cloud-Native Toolkit](https://cloudnativetoolkit.dev/adopting/setup/installing.html).
2. Create projects on your cluster
    ```sh
    ❯ oc login ...
    ❯ oc new-project mapper-dev
    ❯ oc new-project mapper-test
    ❯ oc new-project mapper-staging
    ❯ oc project mapper-dev
    ```
3. Bind your IBM Cloud services (MongoDB, AppId, and COS) to your namespaces:
    ```sh
    ❯ icc <your-cluster> # Log in to cluster using ICC
    ❯ ic oc cluster service bind --cluster dev-mapper-ocp --service builder-mongodb -n mapper-dev # MongoDB
    ❯ ic oc cluster service bind --cluster dev-mapper-ocp --service builder-mongodb -n mapper-test # MongoDB
    ❯ ic oc cluster service bind --cluster dev-mapper-ocp --service builder-mongodb -n mapper-staging # MongoDB
    ❯ ic oc cluster service bind --cluster dev-mapper-ocp --service dev-mapper -n mapper-dev # AppID
    ❯ ic oc cluster service bind --cluster dev-mapper-ocp --service dev-mapper -n mapper-test # AppID
    ❯ ic oc cluster service bind --cluster dev-mapper-ocp --service dev-mapper -n mapper-staging # AppID
    ❯ ic oc cluster service bind --cluster dev-mapper-ocp --service dev-mapper-storage -n mapper-dev # COS
    ❯ ic oc cluster service bind --cluster dev-mapper-ocp --service dev-mapper-storage -n mapper-test # COS
    ❯ ic oc cluster service bind --cluster dev-mapper-ocp --service dev-mapper-storage -n mapper-staging # COS
    ```
4. Update the AppID secrets to add a new `binding-application` key for UI to use and retrieve user roles.
   1. Copy the application credentials of your AppId service on IBM Cloud
      1. Go to your [resource list](https://cloud.ibm.com/resources).
      2. Select your AppId service.
      3. In the **Applications** section, copy your app credentials. **If none**:
         1. Create one with following scopes: `edit`, `view_controls`, `super_edit`.
         2. Create Roles
            1. `editor` with scopes: `edit`
            2. `admin` with scopes: `edit`, `super_edit`
            3. `fs-controls-viewer` with scopes: `view_controls`
         3. Assign Roles
   2. For the `mapper-dev`, `mapper-test` and `mapper-staging` projects, update the AppId secrets to add the new `binding-application` key with the value you just copied:
      1. In the **Workloads > Secrets** section, select the `binding-dev-mapper` secret (`dev-mapper` being the name of our AppId service).
      2. On the top right, click **Edit Secret**.
      3. Scroll down to the bottom and add the new `binding-application` key.
      4. Copy the value you copied earlier, then click **Save**.
      - **NOTE**: it's mandatory to repeat the last steps for the 3 projects: `mapper-dev`, `mapper-test` and `mapper-staging`.
5. Create a configmap in each project for the ui:
    ```sh
    ❯ oc create configmap mapper-ui --from-literal=route=https://mapperui-dev.openfn.co --from-literal=api-host=todo -n mapper-dev
    ❯ oc create configmap mapper-ui --from-literal=route=https://mapperui-test.openfn.co --from-literal=api-host=todo -n mapper-test
    ❯ oc create configmap mapper-ui --from-literal=route=https://mapperui.openfn.co --from-literal=api-host=todo -n mapper-staging
    ```
    - **Note**: We'll update the `api-host` value once we've deployed the BFF APIs.

## Rebuild the project

To incrementally build the project:

```sh
yarn run build
```

To force a full build by cleaning up cached artifacts:

```sh
yarn run rebuild
```

## Fix code style and formatting issues

```sh
yarn run lint
```

To automatically fix such issues:

```sh
yarn run lint:fix
```

## Tests

```sh
export DATABASE_TEST="{connection....}"
yarn test
```

### redis (install on mac)

```sh
brew install redis
brew services start redis
redis-cli
SET "Key" "value"
GET Key
brew services stop redis
```

## What's next

Please check out [LoopBack 4 documentation](https://loopback.io/doc/en/lb4/) to
understand how you can continue to add features to this application.

[![LoopBack](https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png)](http://loopback.io/)

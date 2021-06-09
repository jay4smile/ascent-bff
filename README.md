# FS Cloud Architectures

This application backend will enable a collection of APIs that will support the relationship between a 
Reference Architecture and its Bill of Materials(BOM) (list of comprising services). The BOM relationship to 
the list of FS Ready services. The mapping between the cloud services and the FS Controls. Finally you can 
view the FS Controls mapping to the Cloud Services and the supporting reference Architectures.

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

A script has been provided to simplify this process. The steps to run the script are as follows:

1. Log into the IBM Cloud account using the ibmcloud cli
2. Find the names of the MongoDB and Object Storage instances:
   
    ```shell
    ibmcloud resource service-instances
    ```
   
3. Source the setup-environment script to create the environment variables, passing the names of the services:
   
    ```shell
    source ./scripts/setup-environment.sh {MONGODB_NAME} {COS_NAME}
    ```
   
4. Verify the environment variables have been created by running the following:

    ```shell
    echo $DATABASE_DEV
    echo $STORAGE
    ```

5. The BFF also integrates with App ID protect API resources. Export a variable for AppID:
```sh
export APPID_OAUTH_SERVER_URL="https://<REGION>.appid.cloud.ibm.com/oauth/v4/<ID>"
```

6. Once these values are set it is now possible to run the application:
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
   2. In the `mapper-dev` project, update the AppId secrets to add the new `binding-application` key with the value you just copied:
      1. In the **Workloads > Secrets** section, select the `binding-dev-mapper` secret (`dev-mapper` being the name of our AppId service).
      2. On the top right, click **Edit Secret**.
      3. Scroll down to the bottom and add the new `binding-application` key.
      4. Copy the value you copied earlier, replace `oAuthServerUrl` with `oauthServerUrl`, then click **Save**.
      5. Copy the secret in the `mapper-test` and `mapper-staging` projects:
        ```sh
        ❯ oc get secret binding-dev-mapper -n mapper-dev -o yaml | sed 's/mapper-dev/mapper-test/g' | oc create -f - # AppID
        ❯ oc get secret binding-dev-mapper -n mapper-dev -o yaml | sed 's/mapper-dev/mapper-staging/g' | oc create -f - # AppID
        ```
5. Create a configmap in each project for the ui:
    ```sh
    ❯ oc create configmap mapper-ui --from-literal=route=https://mapperui-dev.openfn.co --from-literal=api-host=todo -n mapper-dev
    ❯ oc create configmap mapper-ui --from-literal=route=https://mapperui-test.openfn.co --from-literal=api-host=todo -n mapper-test
    ❯ oc create configmap mapper-ui --from-literal=route=https://mapperui.openfn.co --from-literal=api-host=todo -n mapper-staging
    ```
    - **Note**: We'll update the `api-host` value once we've deployed the BFF APIs.
6. Create the pipeline for the BFF
   1. Update the `binding-builder-mongodb` secret to add a new `binding-test` key with the same content as the `binding` key, in which you replace every `ibmclouddb` to your test database (mine is `ibmcloudtestdb`).
   2. In OpenShift console, update the `test` step of the `ibm-nodejs-test-v2-6-13` tekton task in `tools` project, to add the variables BFF needs to run testing:
      ```yaml
      ... omitted ...
          - env:
              - name: DATABASE_TEST
                valueFrom:
                  secretKeyRef:
                    key: binding-test
                    name: binding-builder-mongodb
              - name: STORAGE
                valueFrom:
                  secretKeyRef:
                    key: binding
                    name: binding-dev-mapper-storage
            image: $(params.js-image)
            name: test
            resources: {}
            script: |
              CI=true npm test
            workingDir: $(params.source-dir)
      ... omitted ...
      ```
   3. Create the `docker-io` secret to pull `redis` image without encountering docker limit
    ```sh
    ❯ docker login
    ❯ kubectl create secret generic docker-io --from-file=.dockerconfigjson=$HOME/.docker/config.json --type=kubernetes.io/dockerconfigjson -n mapper-dev
    ```
   4. Create the BFF pipeline:
      ```sh
      ❯ oc sync mapper-dev --dev
      ❯ oc pipeline --tekton -u ${GIT_USERNAME} -P ${GIT_ACCESS_TOKEN} -g -n mapper-dev
      ❯ oc secret link pipeline docker-io --for=pull
      ```
   5. Once the pipeline is successful, create the UI pipeline:
      ```sh
      ❯ oc create configmap mapper-ui \
        --from-literal=route=https://mapperui-dev.openfn.co \
        --from-literal=api-host=https://$(oc get routes/architecture-builder-bff -n mapper-dev -o jsonpath='{.spec.host}') \
        -n mapper-dev
      ❯ cd path/to/architecture-builder-ui
      ❯ oc pipeline --tekton -n mapper-dev
      ```
   6. Set up ArgoCD:
      1. Create a new blank gitops repo, refered here as `https://github.ibm.com/gsi-labs/architecture-builder-gitops`)
      2. Set up gitops:
        ```sh
        ❯ git clone https://github.com/IBM/template-argocd-gitops architecture-builder-gitops
        ❯ cd architecture-builder-gitops
        ❯ git remote remove origin
        ❯ git remote add origin https://github.ibm.com/gsi-labs/architecture-builder-gitops
        ❯ git push -u origin main
        ❯ git checkout -b test
        ❯ cp -r templates/project-config-helm architecture-builder-bff
        ❯ cp -r templates/project-config-helm architecture-builder-ui
        ❯ git add .
        ❯ git commit -m "Added helm template"
        ❯ git push -u origin test
        ❯ igc namespace mapper-test
        ❯ oc policy add-role-to-group system:image-puller system:serviceaccounts:mapper-test -n mapper-dev
        ❯ git checkout -b staging
        ❯ git push -u origin staging
        ❯ igc namespace mapper-staging
        ❯ oc policy add-role-to-group system:image-puller system:serviceaccounts:mapper-staging -n mapper-dev
        ❯ oc project mapper-dev
        ❯ git checkout test
        ❯ igc gitops
        ```
      3. On ArgoCD:
         1. Connect gitops repository
         2. Create a new project `architecture-builder`:
            - With gitops repo as source repo
            - With 2 destinations `mapper-test` and `mapper-staging` in current cluster
         3. Create 4 applications under `architecture-builder` project:
            1. `test-architecture-builder-bff`:
               - Sync policy: Automatic
               - Source: gitops repo, `test` revision, `architecture-builder-bff` path
               - Destination: local cluster, `mapper-test` project
               - Click **Create** 
            2. `staging-architecture-builder-bff`:
               - Sync policy: Automatic
               - Source: gitops repo, `staging` revision, `architecture-builder-bff` path
               - Destination: local cluster, `mapper-staging` project
               - Click **Create** 
            3. `test-architecture-builder-ui`:
               - Sync policy: Automatic
               - Source: gitops repo, `test` revision, `architecture-builder-ui` path
               - Destination: local cluster, `mapper-test` project
               - Click **Create** 
            4. `staging-architecture-builder-ui`:
               - Sync policy: Automatic
               - Source: gitops repo, `staging` revision, `architecture-builder-ui` path
               - Destination: local cluster, `mapper-staging` project
               - Click **Create** 
      4. Run the BFF and UI pipelines.
   7. In AppId service dashboard, add the `ui` route to appid valid callback uri. To get it you can copy the output from:
      ```sh
      ❯ echo "https://$(oc get route architecture-builder-ui -n mapper-test -o jsonpath='{.spec.host}')/ibm/cloud/appid/callback"
      ```
   8. Update the `mapper-ui` config map in `mapper-test` project:
      ```sh
      ❯ export API_HOST=https://$(oc get route architecture-builder-bff -n mapper-test -o jsonpath="{.spec.host}") \
        && export APP_URI=https://$(oc get route architecture-builder-ui -n mapper-test -o jsonpath="{.spec.host}") \
        && oc patch cm mapper-ui -n mapper-test --type='json' -p="[{'op' : 'replace' ,'path' : '/data/api-host' ,'value' : $API_HOST}]" \
        && oc patch cm mapper-ui -n mapper-test --type='json' -p="[{'op' : 'replace' ,'path' : '/data/route' ,'value' : $APP_URI}]"
      ```
   9. Once you've tested the app works on test env, submit a PR to `staging` branch of gitops repo from `test`.
   10. In AppId service dashboard, add the `ui` route to appid valid callback uri. To get it you can copy the output from:
      ```sh
      ❯ echo "https://$(oc get route architecture-builder-ui -n mapper-staging -o jsonpath='{.spec.host}')/ibm/cloud/appid/callback"
      ```
   11. Update the `mapper-ui` config map in `mapper-staging` project:
      ```sh
      ❯ export API_HOST=https://$(oc get route architecture-builder-bff -n mapper-staging -o jsonpath="{.spec.host}") \
        && export APP_URI=https://$(oc get route architecture-builder-ui -n mapper-staging -o jsonpath="{.spec.host}") \
        && oc patch cm mapper-ui -n mapper-staging --type='json' -p="[{'op' : 'replace' ,'path' : '/data/api-host' ,'value' : $API_HOST}]" \
        && oc patch cm mapper-ui -n mapper-staging --type='json' -p="[{'op' : 'replace' ,'path' : '/data/route' ,'value' : $APP_URI}]"
      ```

There you go, you should have your delivery pipeline up and running!

**Known issues**:
- ArgoCD application controller might not be able to create resource in `mapper-test` and `mapper-staging` projects. If so the following should fix the issue:
  ```sh
  ❯ oc policy add-role-to-user edit system:serviceaccounts:tools:argocd-argocd-application-controller -n mapper-test
  ❯ oc policy add-role-to-user edit system:serviceaccounts:tools:argocd-argocd-application-controller -n mapper-staging
  ```
- Access to IBM Cloud image registry from `mapper-test` and `mapper-staging`:
  ```sh
  ❯ oc get secret all-icr-io -n default -o yaml | sed 's/default/mapper-test/g' | oc create -n mapper-test -f -
  ❯ oc get secret all-icr-io -n default -o yaml | sed 's/default/mapper-staging/g' | oc create -n mapper-staging -f -
  ❯ oc secret link default all-icr-io --for=pull -n mapper-test
  ❯ oc secret link default all-icr-io --for=pull -n mapper-staging
  ```

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

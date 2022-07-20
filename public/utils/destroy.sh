#! /bin/bash
#Read options passed while execution
while getopts f:c: option
do
    case "${option}"
        in
        f) RESOURCE_FILTER=${OPTARG};;
        c) CREDENTIAL=${OPTARG};;
    esac
done
#if flag c has been passed as a true then  read credential file to set key and secret to TF_VAR
if [[ -n "${CREDENTIAL}" ]]; then
echo ""
echo "Reading credentials"

INI_FILE=~/.aws/credentials

while IFS=' = ' read key value
do
    if [[ $key == \[*] ]]; then
        section=$key
    elif [[ $value ]] && [[ $section == '[default]' ]]; then
        if [[ $key == 'aws_access_key_id' ]]; then
            AWS_ACCESS_KEY_ID=$value
        elif [[ $key == 'aws_secret_access_key' ]]; then
            AWS_SECRET_ACCESS_KEY=$value
        fi
    fi
done < $INI_FILE

export TF_VAR_access_key=$AWS_ACCESS_KEY_ID
export TF_VAR_secret_key=$AWS_SECRET_ACCESS_KEY

fi

echo ""
echo "Listing current state"
terraform state list

if [[ -n "${RESOURCE_FILTER}" ]]; then
  echo ""
  echo "Collecting resources to destroy using filter: ${RESOURCE_FILTER}"
  RESOURCE_LIST=""
  while read -r resource; do
    echo "  Adding $resource to destroy targets"
    RESOURCE_LIST="$RESOURCE_LIST -target=$resource"
  done < <(terraform state list | grep -E "${RESOURCE_FILTER}")
else
  echo ""
  echo "Collecting resources to destroy"
  RESOURCE_LIST=""
  while read -r resource; do
    echo "  Adding $resource to destroy targets"
    RESOURCE_LIST="$RESOURCE_LIST -target=$resource"
  done < <(terraform state list)
fi

if [[ -n "$RESOURCE_LIST" ]]; then
  echo ""
  echo "Planning destroy"
  terraform plan -destroy ${RESOURCE_LIST} -out=destroy.plan

  echo ""
  echo "Destroying resources"
  terraform apply -auto-approve destroy.plan
else
  echo ""
  echo "Nothing to destroy!!"
fi


export interface CatalogConfig {
  url: string;
  latestReleaseUrl: string
}

const config: CatalogConfig = {
  url: 'https://modules.cloudnativetoolkit.dev/index.yaml',
  latestReleaseUrl: 'https://api.github.com/repos/cloud-native-toolkit/iascable/releases/latest'
};

export default config;

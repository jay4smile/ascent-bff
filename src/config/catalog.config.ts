
export interface CatalogConfig {
  url: string;
  summaryUrl: string;
  latestReleaseUrl: string
}

const config: CatalogConfig = {
  url: 'https://modules.cloudnativetoolkit.dev/index.yaml',
  summaryUrl: 'https://modules.cloudnativetoolkit.dev/summary.yaml',
  latestReleaseUrl: 'https://api.github.com/repos/cloud-native-toolkit/iascable/releases/latest'
};

export default config;

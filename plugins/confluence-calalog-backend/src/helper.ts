
import * as fs from 'fs';
import { promisify } from 'util';
import { promises as fsPromises } from 'fs';

import fetch from 'node-fetch';
import https from 'https';

import { JsonArray, JsonObject, JsonValue } from '@backstage/types';
import * as path from 'path';
import * as os from 'os';
import { load } from 'js-yaml';
import { Entity } from '@backstage/catalog-model';

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const agent = new https.Agent({
  rejectUnauthorized: false,
});



interface ProjectInfo {
    [key: string]: string | number | true | JsonObject | JsonArray;
  }
  
  const getConfluenceHeader = (confluenceAuthToken: string): any => {
    const headers = {
      Authorization: `Bearer ${confluenceAuthToken}`,
      'Content-Type': 'application/json',
    };
    return headers;
  };
  
  const getPostData = (
    pageTitle: string,
    spaceId: string,
    htmlData: string,
    confluencePageInfo: any,
  ): any => {
    const postData = {
      type: 'page',
      title: pageTitle,
      space: {
        key: spaceId,
      },
      body: {
        storage: {
          value: htmlData,
          representation: 'storage',
        },
      },
      version: {
        number: confluencePageInfo?.version.number + 1,
      },
    };
  
    return postData;
  };
  
  const updateHtmlData = (
    html: string,
    key: string,
    value: JsonValue | string | undefined,
  ): string => {
    return html.replace(key, value ? value?.toString() : key);
  };
  
  const getTemplateContent = async (localDirectory: string): Promise<string> => {
    const htmlFilePath = path.join(localDirectory, 'content.html');
    try {
      const fileContent = await fsPromises.readFile(htmlFilePath, 'utf-8');
      return fileContent;
    } catch (error) {
      console.error('Error reading file:', error);
      return '';
    }
  };
  
  const getConfluencePageInfo = async (
    pageId: string,
    confluenceApiBaseUrl: string | undefined,
    headers: any,
  ) => {
    try {
      const url = new URL(`/rest/api/content/${pageId}`, confluenceApiBaseUrl)
        .href;
      const options = {
        method: 'GET',
        headers: headers,
        agent: agent,
      };
  
      const response = await fetch(url, options);
  
      if (!response.ok) {
        // throw new Error('Failed to fetch Confluence page info');
        return null;
      }
  
      const data = await response.json();
  
      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  };
  
  const getConfluenceUser = async (
    username: string,
    confluenceApiBaseUrl: string | undefined,
    headers: any,
  ) => {
    try {
      const url = new URL(
        `rest/api/user?username=${username}`,
        confluenceApiBaseUrl,
      ).href;
      const options = {
        method: 'GET',
        headers: headers,
        agent: agent,
      };
  
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error('Failed to fetch Confluence page info');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  };
  
  const getUserKey = async (
    username: JsonValue | undefined,
    confluenceApiBaseUrl: string | undefined,
    headers: any,
  ): Promise<any> => {
    const user = username ? username?.toString() : '';
    if (user) {
      const userData = await getConfluenceUser(
        user,
        confluenceApiBaseUrl,
        headers,
      );
      return userData.userKey;
    }
  
    return username;
  };
  
  const readColorsFile = (localDirectory: string): any => {
    try {
      const filePath = path.join(localDirectory, 'colors.yaml');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const jsonData = load(fileContent);
      return jsonData;
    } catch (error) {
      console.error('Error reading YAML file:', error);
      return null;
    }
  };
  
  const isPreviousContentSame = async (
    pageId: string,
    newContent: string,
  ): Promise<any> => {
    try {
      const tempDir = fs.realpathSync(os.tmpdir());
      const pageDir = path.join(tempDir, 'confluence-pages');
      const pageFile = path.join(pageDir, `${pageId}.html`);
      if (!fs.existsSync(pageDir)) {
        fs.mkdirSync(pageDir);
        console.log('The directory doesnt exists');
      }
      if (!fs.existsSync(pageFile)) {
        console.log('The file doesnt exist.');
        await writeFileAsync(pageFile, newContent);
        return false;
      }
      const previousContent = await readFileAsync(pageFile, 'utf-8');
      if (previousContent === newContent) {
        console.log('Both are same');
        return true;
      }
      console.log('Both are not same');
      await writeFileAsync(pageFile, newContent);
      return false;
    } catch (error) {
      console.error('Error reading YAML file:', error);
      return null;
    }
  };
  
  export const updateConfluencePage = async (
    entity: Entity,
    confluenceApiBaseUrl: string | undefined,
    confluenceAuthToken: string | undefined,
    confluenceDirectory: string | undefined,
  ) => {
    const pageId = entity.metadata.confluencePageId?.toString();
    const pageTitle = entity.metadata.confluencePageTitle?.toString();
    const spaceId = entity.metadata.confluenceSpaceId?.toString();
  
    console.log('pageTitle', pageTitle);
  
    if (
      pageId &&
      pageTitle &&
      spaceId &&
      confluenceApiBaseUrl &&
      confluenceAuthToken &&
      confluenceDirectory
    ) {
      try {
        const headers = getConfluenceHeader(confluenceAuthToken);
  
        const userName = await getUserKey(
          entity.spec?.informationAuthor,
          confluenceApiBaseUrl,
          headers,
        );
  
        const projectInfo = entity.spec?.projectInfo;
        const getProjectInfo = (key: string): string | boolean | any => {
          if (projectInfo && projectInfo.hasOwnProperty(key)) {
            return (projectInfo as ProjectInfo)[key];
          }
          return false;
        };
        const colorsData = readColorsFile(confluenceDirectory);
  
        const getColorValue = (
          clrData: any[],
          key: string,
        ): string | undefined => {
          const colorItem = clrData.find(item => key in item);
          return colorItem ? colorItem[key] : undefined;
        };
  
        const developmentStatusColor =
          getColorValue(
            colorsData?.developmentStatus,
            getProjectInfo('developmentStatus'),
          ) || 'blue';
        const modalityColor =
          getColorValue(colorsData?.modality, getProjectInfo('modality')) ||
          'blue';
  
        getTemplateContent(confluenceDirectory)
          .then(async html => {
            let htmlData = html;
            if (htmlData.length > 1) {
              htmlData = updateHtmlData(
                htmlData,
                '{moduleName}',
                getProjectInfo('moduleName'),
              );
              htmlData = updateHtmlData(
                htmlData,
                '{informationAuthor}',
                userName,
              );
              htmlData = updateHtmlData(
                htmlData,
                '{modality}',
                getProjectInfo('modality'),
              );
              htmlData = updateHtmlData(
                htmlData,
                '{modalityColor}',
                modalityColor,
              );
              htmlData = updateHtmlData(
                htmlData,
                '{bodyParts}',
                getProjectInfo('bodyParts'),
              );
              htmlData = updateHtmlData(
                htmlData,
                '{processingPurpose}',
                getProjectInfo('processingPurpose'),
              );
              htmlData = updateHtmlData(
                htmlData,
                '{protocol}',
                getProjectInfo('protocol'),
              );
              htmlData = updateHtmlData(
                htmlData,
                '{algorithmType}',
                getProjectInfo('algorithmType'),
              );
              htmlData = updateHtmlData(
                htmlData,
                '{packageType}',
                getProjectInfo('packageType'),
              );
              htmlData = updateHtmlData(
                htmlData,
                '{supportedOs}',
                getProjectInfo('supportedOs'),
              );
              htmlData = updateHtmlData(
                htmlData,
                '{sourceCodeLanguage}',
                getProjectInfo('sourceCodeLanguage'),
              );
              htmlData = updateHtmlData(
                htmlData,
                '{developmentStatus}',
                getProjectInfo('developmentStatus'),
              );
              htmlData = updateHtmlData(
                htmlData,
                '{developmentStatusColor}',
                developmentStatusColor,
              );
              htmlData = updateHtmlData(
                htmlData,
                '{linkToProjectPage}',
                getProjectInfo('linkToProjectPage'),
              );
  
              const previousContentStatus = await isPreviousContentSame(
                pageId,
                htmlData,
              );
              if (!previousContentStatus) {
                const confluencePageInfo = await getConfluencePageInfo(
                  pageId,
                  confluenceApiBaseUrl,
                  headers,
                );
  
                const postData = getPostData(
                  pageTitle,
                  spaceId,
                  htmlData,
                  confluencePageInfo,
                );
                const url = new URL(
                  `/rest/api/content/${pageId}`,
                  confluenceApiBaseUrl,
                ).href;
                const options = {
                  method: 'PUT',
                  headers: headers,
                  body: JSON.stringify(postData),
                  agent: agent,
                };
                await fetch(url, options);
              }
            }
          })
          .catch(error => {
            console.error('Error:', error);
          });
      } catch (e) {
        console.log(e);
      }
    }
  };
  

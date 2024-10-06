import { HeadOptions } from "../types";

let headUidCounter = 0;
const pageHeadMap = new Map();

export function Head(options: HeadOptions) {
  const pageHeadUid = headUidCounter++;

  return function (): void {
    const documentHead = document.head;

    for (const [uid, value] of pageHeadMap.entries()) {
      if (uid === pageHeadUid) continue;

      for (const node of value) {
        documentHead.removeChild(node);
      }
    }

    const pageHeadNodes = pageHeadMap.get(pageHeadUid);

    if (!pageHeadNodes) {
      const headNodes = [];

      if (options.title) {
        const existingTitle = documentHead.querySelector("title");

        if (existingTitle) {
          existingTitle.textContent = options.title;
          headNodes.push(existingTitle);
        } else {
          const title = document.createElement("title");
          title.textContent = options.title;
          documentHead.appendChild(title);
          headNodes.push(title);
        }
      }

      if (options.meta) {
        for (const meta of options.meta) {
          const metaNode = document.createElement("meta");
          for (const [key, value] of Object.entries(meta)) {
            metaNode.setAttribute(key, value);
          }
          documentHead.appendChild(metaNode);
          headNodes.push(metaNode);
        }
      }

      if (options.link) {
        for (const link of options.link) {
          const linkNode = document.createElement("link");
          for (const [key, value] of Object.entries(link)) {
            linkNode.setAttribute(key, value);
          }
          documentHead.appendChild(linkNode);
          headNodes.push(linkNode);
        }
      }

      if (options.script) {
        for (const script of options.script) {
          const scriptNode = document.createElement("script");
          for (const [key, value] of Object.entries(script)) {
            scriptNode.setAttribute(key, String(value));
          }
          documentHead.appendChild(scriptNode);
          headNodes.push(scriptNode);
        }
      }

      pageHeadMap.set(pageHeadUid, headNodes);
    } else {
      for (const node of pageHeadNodes) {
        documentHead.appendChild(node);
      }
    }
  };
}

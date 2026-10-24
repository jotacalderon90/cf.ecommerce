'use strict';

const logger = require('cl.jotacalderon.cf.framework/lib/log')(__filename);

const self = function () {};

self.prototype.getTagsBySetting = function (path, setting, category_name) {
  try {
    if (path == '/' || path.indexOf('/categoria/') == -1) {
      return this.tagToTree(setting.tag, false);
    } else /*/categoria/*/ {
      const getTag = function (tags, parent) {
        for (let i = 0; i < tags.length; i++) {
          if (typeof tags[i] == 'string' && tags[i] == parent) {
            return setting.tag;
          } else if (typeof tags[i] == 'object' && tags[i].label == parent) {
            if (tags[i].tag && tags[i].tag.length > 0) {
              return tags[i].tag;
            } else {
              return setting.tag;
            }
          } else if (
            typeof tags[i] == 'object' &&
            tags[i].label != parent &&
            tags[i].tag &&
            tags[i].tag.length > 0
          ) {
            const t = getTag(tags[i].tag, parent);
            if (t != null) {
              return t;
            }
          }
        }
      };

      const tag = getTag(setting.tag, category_name);
      if (tag === undefined) {
        return this.tagToTree(setting.tag, false);
      } else {
        return this.tagToTree(tag, false);
      }
    }
  } catch (error) {
    logger.error(error);
    return [];
  }
};

self.prototype.tagToTree = function (tag, recursive) {
  let r = [];
  for (let i = 0; i < tag.length; i++) {
    if (typeof tag[i] === 'string') {
      r.push(tag[i]);
    } else if (typeof tag[i] === 'object') {
      /* && (!tag[i].roles || tag[i].roles.indexOf(role) > -1)*/
      r.push(tag[i].label);
      if (recursive && tag[i].tag) {
        r = r.concat(this.tagToTree(tag[i].tag, recursive));
      }
    }
  }
  return r;
};

module.exports = new self();

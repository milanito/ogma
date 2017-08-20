import { get } from 'lodash';

import json from './json';
import flatjson from './flatjson';
import apple from './apple';
import android from './android';
import csv from './csv';
import yaml from './yaml';

/**
 * Default type for exports
 */
const TYPES = {
  apple: 'text/plain',
  android: 'text/xml',
  flatjson: 'application/json',
  csv: 'text/csv',
  json: 'application/json',
  yaml: 'text/plain'
};

export default {
  apple,
  android,
  flatjson,
  csv,
  json,
  yaml
};

/**
 * Return the content type to use for the given
 * export type
 * @param { String } type the export type
 * @return { String } the content type
 */
export const getContentType = type =>
  get(TYPES, type, 'text/plain');

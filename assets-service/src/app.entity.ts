import { AssetType } from '@bridged.xyz/client-sdk/lib';
import * as dynamoose from 'dynamoose';
import { nanoid } from 'nanoid';

/**
 //  * the table definition of asset. the asset can be temporary, and it does not contains any information of which holds this asset.
 */
export interface RawAssetTable {
  id: string;
  name: string;
  type: AssetType;
  value: string;
  tags?: string[];
}

/**
 * record of project's managed variant asset.
 * unique with (project-id & key & type)
 */
export interface VariantAssetTable {
  /**
   * id generated by the server
   */
  id: string;

  /**
   * the id of the project. (this is not a file id!)
   * i.e. figma project is not a bridged project. multiple projects on the design tools can be a single project on bridged system.
   */
  projectId: string;

  /**
   * *REQUIRED*
   * key of this variant asset.
   */
  key: string;

  /**
   * *REQUIRED*
   * explicit name set by editor
   */
  name?: string;

  /**
   * description of this localized, variantized asset set by editor
   */
  description?: string;

  /**
   * *REQUIRED*
   * type of asset alias
   */
  type: AssetType;

  /**
   * *REQUIRED*
   *  variant : asset id
   * e.g. "en_US": "G2ggs93", where 'G2ggs93' is an id of asset
   *  */
  assets: Map<string, string>;

  tags?: string[];
}

const RawAssetSchema = new dynamoose.Schema({
  id: {
    type: String,
    default: () => nanoid(),
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: [
      'URI',
      'TEXT',
      'IMAGE',
      'ICON',
      'ILLUST',
      'COLOR',
      'FILE',
      'UNKNOWN',
    ],
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  tags: {
    type: Set,
    schema: [String],
    required: false,
  },
});

const TBL_RAW_ASSETS = process.env.DYNAMODB_TABLE_RAW_ASSETS;
export const RawAssetModel = dynamoose.model(TBL_RAW_ASSETS, RawAssetSchema, {
  create: false,
});

const VariantAssetSchema = new dynamoose.Schema(
  {
    id: {
      type: String,
      default: () => nanoid(),
    },
    projectId: {
      type: String,
      required: true,
      index: {
        name: 'projectIndex',
      },
    },
    key: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      enum: [
        'URI',
        'TEXT',
        'IMAGE',
        'ICON',
        'ILLUST',
        'COLOR',
        'FILE',
        'UNKNOWN',
      ],
      required: true,
    },
    // TODO change type to string: string map -> {variant: raw-asset-id}
    assets: {
      type: Object,
      default: { default: '__empty__' },
      required: true,
    },
    // tags: {
    //     type: Set,
    //     default: [],
    //     required: false
    // }
  },
  {
    saveUnknown: true,
  },
);

const TBL_VARIANT_ASSETS = process.env.DYNAMODB_TABLE_VARIANT_ASSETS;
export const VariantAssetModel = dynamoose.model(
  TBL_VARIANT_ASSETS,
  VariantAssetSchema,
  {
    create: false,
  },
);

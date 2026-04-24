/**
 * Elasticsearch Search Service
 * Issue #668: Implement Search Service with Elasticsearch
 * 
 * Provides full-text search capabilities with indexing, faceted search,
 * suggestions, and relevance scoring.
 */

import { Client } from '@elastic/elasticsearch'
import { createModuleLogger } from '../utils/logger'

const logger = createModuleLogger('ElasticsearchService')

export interface SearchQuery {
  q: string
  filters?: Record<string, any>
  facets?: string[]
  page?: number
  limit?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

export interface SearchResult<T> {
  hits: T[]
  total: number
  page: number
  limit: number
  facets?: Record<string, any>
  suggestions?: string[]
}

export interface IndexConfig {
  name: string
  settings?: Record<string, any>
  mappings?: Record<string, any>
}

export class ElasticsearchService {
  private client: Client
  private indices: Map<string, IndexConfig> = new Map()

  constructor(node: string = process.env.ELASTICSEARCH_URL || 'http://localhost:9200') {
    this.client = new Client({ node })
  }

  /**
   * Initialize index with settings and mappings
   */
  async initializeIndex(config: IndexConfig): Promise<void> {
    try {
      const exists = await this.client.indices.exists({ index: config.name })

      if (!exists) {
        await this.client.indices.create({
          index: config.name,
          settings: config.settings || {
            number_of_shards: 1,
            number_of_replicas: 0,
            analysis: {
              analyzer: {
                default: {
                  type: 'standard',
                  stopwords: '_english_',
                },
              },
            },
          },
          mappings: config.mappings || {
            properties: {
              id: { type: 'keyword' },
              name: { type: 'text', analyzer: 'standard' },
              description: { type: 'text', analyzer: 'standard' },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' },
            },
          },
        })
        logger.info('Index created', { index: config.name })
      }

      this.indices.set(config.name, config)
    } catch (error) {
      logger.error('Failed to initialize index', { error, index: config.name })
      throw error
    }
  }

  /**
   * Index a document
   */
  async indexDocument(index: string, id: string, document: Record<string, any>): Promise<void> {
    try {
      await this.client.index({
        index,
        id,
        document: {
          ...document,
          updatedAt: new Date(),
        },
      })
      logger.debug('Document indexed', { index, id })
    } catch (error) {
      logger.error('Failed to index document', { error, index, id })
      throw error
    }
  }

  /**
   * Bulk index documents
   */
  async bulkIndex(index: string, documents: Array<{ id: string; data: Record<string, any> }>): Promise<void> {
    try {
      const body = documents.flatMap(({ id, data }) => [
        { index: { _index: index, _id: id } },
        { ...data, updatedAt: new Date() },
      ])

      await this.client.bulk({ body })
      logger.info('Documents bulk indexed', { index, count: documents.length })
    } catch (error) {
      logger.error('Failed to bulk index documents', { error, index })
      throw error
    }
  }

  /**
   * Full-text search with facets and suggestions
   */
  async search<T = any>(index: string, query: SearchQuery): Promise<SearchResult<T>> {
    try {
      const from = ((query.page || 1) - 1) * (query.limit || 20)
      const size = query.limit || 20

      const must: any[] = []
      const filter: any[] = []

      // Full-text search
      if (query.q) {
        must.push({
          multi_match: {
            query: query.q,
            fields: ['name^2', 'description', 'content'],
            fuzziness: 'AUTO',
          },
        })
      }

      // Filters
      if (query.filters) {
        Object.entries(query.filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            filter.push({ terms: { [key]: value } })
          } else {
            filter.push({ term: { [key]: value } })
          }
        })
      }

      const aggs: Record<string, any> = {}
      if (query.facets) {
        query.facets.forEach((facet) => {
          aggs[facet] = { terms: { field: facet, size: 10 } }
        })
      }

      const response = await this.client.search({
        index,
        from,
        size,
        query: {
          bool: {
            must: must.length > 0 ? must : [{ match_all: {} }],
            filter: filter.length > 0 ? filter : undefined,
          },
        },
        aggs: Object.keys(aggs).length > 0 ? aggs : undefined,
        sort: query.sortBy ? [{ [query.sortBy]: { order: query.sortDir || 'desc' } }] : undefined,
      })

      const hits = response.hits.hits.map((hit) => ({
        ...hit._source,
        _score: hit._score,
      })) as T[]

      const facets: Record<string, any> = {}
      if (response.aggregations) {
        Object.entries(response.aggregations).forEach(([key, agg]: [string, any]) => {
          facets[key] = agg.buckets.map((bucket: any) => ({
            value: bucket.key,
            count: bucket.doc_count,
          }))
        })
      }

      return {
        hits,
        total: response.hits.total as any,
        page: query.page || 1,
        limit: size,
        facets: Object.keys(facets).length > 0 ? facets : undefined,
      }
    } catch (error) {
      logger.error('Search failed', { error, index, query: query.q })
      throw error
    }
  }

  /**
   * Get search suggestions
   */
  async getSuggestions(index: string, prefix: string, field: string = 'name'): Promise<string[]> {
    try {
      const response = await this.client.search({
        index,
        size: 0,
        query: {
          match_phrase_prefix: {
            [field]: {
              query: prefix,
            },
          },
        },
        aggs: {
          suggestions: {
            terms: {
              field,
              size: 10,
            },
          },
        },
      })

      const suggestions = (response.aggregations?.suggestions as any)?.buckets.map(
        (bucket: any) => bucket.key
      ) || []

      return suggestions
    } catch (error) {
      logger.error('Failed to get suggestions', { error, index, prefix })
      return []
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(index: string, id: string): Promise<void> {
    try {
      await this.client.delete({ index, id })
      logger.debug('Document deleted', { index, id })
    } catch (error) {
      logger.error('Failed to delete document', { error, index, id })
      throw error
    }
  }

  /**
   * Delete index
   */
  async deleteIndex(index: string): Promise<void> {
    try {
      await this.client.indices.delete({ index })
      this.indices.delete(index)
      logger.info('Index deleted', { index })
    } catch (error) {
      logger.error('Failed to delete index', { error, index })
      throw error
    }
  }

  /**
   * Get index stats
   */
  async getIndexStats(index: string): Promise<Record<string, any>> {
    try {
      const stats = await this.client.indices.stats({ index })
      return stats.indices?.[index] || {}
    } catch (error) {
      logger.error('Failed to get index stats', { error, index })
      throw error
    }
  }

  /**
   * Reindex documents
   */
  async reindex(sourceIndex: string, targetIndex: string): Promise<void> {
    try {
      await this.client.reindex({
        body: {
          source: { index: sourceIndex },
          dest: { index: targetIndex },
        },
      })
      logger.info('Index reindexed', { sourceIndex, targetIndex })
    } catch (error) {
      logger.error('Failed to reindex', { error, sourceIndex, targetIndex })
      throw error
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const health = await this.client.cluster.health()
      return health.status !== 'red'
    } catch (error) {
      logger.error('Health check failed', { error })
      return false
    }
  }
}

// Initialize with environment config
const elasticsearchUrl = process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
export const elasticsearchService = new ElasticsearchService(elasticsearchUrl)

// Index configurations
export const GROUPS_INDEX_CONFIG: IndexConfig = {
  name: 'groups',
  mappings: {
    properties: {
      id: { type: 'keyword' },
      name: { type: 'text', analyzer: 'standard' },
      description: { type: 'text', analyzer: 'standard' },
      contributionAmount: { type: 'long' },
      frequency: { type: 'keyword' },
      maxMembers: { type: 'integer' },
      currentMembers: { type: 'integer' },
      isActive: { type: 'boolean' },
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' },
    },
  },
}

export const USERS_INDEX_CONFIG: IndexConfig = {
  name: 'users',
  mappings: {
    properties: {
      id: { type: 'keyword' },
      walletAddress: { type: 'keyword' },
      name: { type: 'text', analyzer: 'standard' },
      email: { type: 'keyword' },
      trustScore: { type: 'float' },
      kycLevel: { type: 'integer' },
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' },
    },
  },
}

export const TRANSACTIONS_INDEX_CONFIG: IndexConfig = {
  name: 'transactions',
  mappings: {
    properties: {
      id: { type: 'keyword' },
      txHash: { type: 'keyword' },
      groupId: { type: 'keyword' },
      userId: { type: 'keyword' },
      amount: { type: 'long' },
      status: { type: 'keyword' },
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' },
    },
  },
}

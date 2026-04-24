import { Router, Request, Response } from 'express'
import {
  getVersionInfo,
  getAllVersionsMetadata,
  getVersionMetadata,
  CURRENT_VERSION,
  SUPPORTED_VERSIONS,
} from '../utils/apiVersioning'

const router = Router()

/**
 * GET /api/versions - Get all API versions information
 */
router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: getVersionInfo(),
  })
})

/**
 * GET /api/versions/current - Get current API version
 */
router.get('/current', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      currentVersion: CURRENT_VERSION,
      metadata: getVersionMetadata(CURRENT_VERSION),
    },
  })
})

/**
 * GET /api/versions/:version - Get specific version information
 */
router.get('/:version', (req: Request, res: Response) => {
  const { version } = req.params
  const versionKey = version.startsWith('v') ? version : `v${version}`

  if (!SUPPORTED_VERSIONS.includes(versionKey as any)) {
    return res.status(404).json({
      success: false,
      error: `Version ${versionKey} not found`,
      supportedVersions: SUPPORTED_VERSIONS,
    })
  }

  res.json({
    success: true,
    data: {
      version: versionKey,
      metadata: getVersionMetadata(versionKey as any),
    },
  })
})

/**
 * GET /api/versions/migration-guide/:from/:to - Get migration guide between versions
 */
router.get('/migration-guide/:from/:to', (req: Request, res: Response) => {
  const { from, to } = req.params
  const fromVersion = from.startsWith('v') ? from : `v${from}`
  const toVersion = to.startsWith('v') ? to : `v${to}`

  if (!SUPPORTED_VERSIONS.includes(fromVersion as any) || !SUPPORTED_VERSIONS.includes(toVersion as any)) {
    return res.status(404).json({
      success: false,
      error: 'One or both versions not found',
      supportedVersions: SUPPORTED_VERSIONS,
    })
  }

  const fromMetadata = getVersionMetadata(fromVersion as any)
  const toMetadata = getVersionMetadata(toVersion as any)

  res.json({
    success: true,
    data: {
      from: fromVersion,
      to: toVersion,
      fromMetadata,
      toMetadata,
      breakingChanges: toMetadata.breakingChanges || [],
      migrationGuide: toMetadata.migrationGuide,
    },
  })
})

export const versionsRouter = router

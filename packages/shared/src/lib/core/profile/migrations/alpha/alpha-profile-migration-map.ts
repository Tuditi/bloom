import { ProfileMigrationMap } from '../../types'
import { alphaProfileMigration0To1 } from './alpha-profile-migration-0-to-1'
import { alphaProfileMigration1To2 } from './alpha-profile-migration-1-to-2'
import { alphaProfileMigration2To3 } from './alpha-profile-migration-2-to-3'
import { alphaProfileMigration3To4 } from './alpha-profile-migration-3-to-4'
import { alphaProfileMigration4To5 } from './alpha-profile-migration-4-to-5'
import { alphaProfileMigration5To6 } from './alpha-profile-migration-5-to-6'

export const ALPHA_PROFILE_MIGRATION_MAP: ProfileMigrationMap = {
    0: alphaProfileMigration0To1,
    1: alphaProfileMigration1To2,
    2: alphaProfileMigration2To3,
    3: alphaProfileMigration3To4,
    4: alphaProfileMigration4To5,
    5: alphaProfileMigration5To6,
}

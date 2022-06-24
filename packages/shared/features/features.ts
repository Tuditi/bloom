import onboardingFeatures from './onboardingFeatures'

const features = {
    onboarding: onboardingFeatures,
    settings: {
        enabled: true,
        general: {
            enabled: true,
            theme: {
                enabled: true,
            },
            language: {
                enabled: true,
            },
            currency: {
                enabled: true,
            },
            notifications: {
                enabled: true,
            },
            networkStatus: {
                enabled: true,
            },
            changeProfileName: {
                enabled: true,
            },
        },
        security: {
            enabled: true,
            exportStronghold: {
                enabled: true,
            },
            appLock: {
                enabled: true,
            },
            changePassword: {
                enabled: true,
            },
            changePincode: {
                enabled: false,
            },
            deleteProfile: {
                enabled: true,
            },
        },
        advanced: {
            enabled: true,
            networkConfiguration: {
                enabled: true,
            },
            deepLinks: {
                enabled: true,
            },
            walletFinder: {
                enabled: true,
            },
            hiddenAccounts: {
                enabled: true,
            },
            errorLog: {
                enabled: true,
            },
            crashReporting: {
                enabled: true,
            },
            diagnostics: {
                enabled: true,
            },
            migrateLedgerIndex: {
                enabled: false,
            },
        },
        helpAndInfo: {
            enabled: true,
            documentation: {
                enabled: true,
            },
            faq: {
                enabled: true,
            },
            discord: {
                enabled: true,
            },
            reportAnIssue: {
                enabled: true,
            },
        },
    },
    wallet: {
        enabled: true,
        accountSummaryAndAssets: {
            enabled: true,
        },
        activityHistory: {
            enabled: true,
            sync: {
                enabled: true,
            },
            search: {
                enabled: true,
            },
        },
        portfolioChart: {
            enabled: false,
        },
        activityChart: {
            enabled: false,
        },
    },
    staking: {
        enabled: false,
    },
    governance: {
        enabled: false,
    },
    collectibles: {
        enabled: false,
    },
}

export default features
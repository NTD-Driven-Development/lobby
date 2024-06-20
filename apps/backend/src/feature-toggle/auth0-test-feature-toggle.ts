import { SimpleFeatureToggle } from './simple-feature-toggle'

export const Auth0TestFeatureToggle: SimpleFeatureToggle = {
    isEnabled: () => {
        return process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'ci'
    },
}

import type { SchemaTypeDefinition } from 'sanity'

import { author } from './author'
import { post } from './post'
import { treatment } from './treatment'
import { treatmentCategory } from './treatmentCategory'

export const schemaTypes: SchemaTypeDefinition[] = [
  treatmentCategory,
  treatment,
  author,
  post,
]

import { defineField, defineType } from 'sanity'

export const treatmentCategory = defineType({
  name: 'treatmentCategory',
  title: 'Treatment Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Display order',
      type: 'number',
      description:
        'Controls the order of category tabs on the Treatments page. Lower numbers appear first.',
      validation: (rule) => rule.integer().min(0),
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'order' },
    prepare: ({ title, subtitle }) => ({
      title,
      subtitle: subtitle != null ? `Order: ${subtitle}` : 'No order set',
    }),
  },
  orderings: [
    {
      title: 'Display order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
})

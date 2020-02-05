---
'@arch-ui/docs': patch
'@keystonejs/website': patch
---

Website: gatsby dependency update

Updated the following dependencies:

gatsby:                             2.13.25  ->  2.19.12
gatsby-plugin-google-analytics:     2.1.4    ->  2.1.35
gatsby-plugin-lunr:                 1.4.0    ->  1.5.2
gatsby-plugin-manifest:             2.2.3    ->  2.2.41
gatsby-plugin-mdx:                  1.0.64   ->  1.0.70
gatsby-plugin-react-helmet:         3.1.2    ->  3.1.22
gatsby-plugin-sharp:                2.2.7    ->  2.4.5
gatsby-remark-autolink-headers:     2.1.21   ->  2.1.24
gatsby-remark-check-links:          2.0.4    ->  2.1.0
gatsby-remark-copy-linked-files:    2.1.3    ->  2.1.37
gatsby-remark-images:               3.1.6    ->  3.1.44
gatsby-source-filesystem:           2.1.5    ->  2.1.48
gatsby-transformer-remark:          2.6.6    ->  2.6.50

This also fixed a build issue on Node 13. `gatsby-plugin-manifest` and `gatsby-plugin-sharp` both relied on sharp lower than v0.23.0,
which removed some code that no longer built on Node 13. See https://github.com/lovell/sharp/commit/631a3597c7bbca3cd3f4d1c76febad50f6d8cf44

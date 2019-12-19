module.exports = {
  siteMetadata: {
    siteTitle: 'Santi Vazquez Personal Website',
    siteDescription: 'Santi Vazquez is a Software Engineer from Argentina',
    siteImage: '/banner.png', // main image of the site for metadata
    siteUrl: 'https://santivazquez.dev/',
    pathPrefix: '/',
    siteLanguage: 'en',
    ogLanguage: `en_US`,
    author: 'Santiago Vazquez',
    authorDescription: 'Software Engineer from Argentina', // short text about the author
    avatar: '/avatar.png',
    twitterSite: '', // website account on twitter
    twitterCreator: '', // creator account on twitter
    social: [
      {
        icon: `twitter`,
        url: `https://twitter.com/savazq`
      },
      {
        icon: `github`,
        url: `https://github.com/santiagovazquez`
      },
      {
        icon: 'linkedin',
        url: `https://www.linkedin.com/in/svazquez/`
      },
    ]
  },
  plugins: [
    {
      resolve: 'gatsby-theme-chronoblog',
      options: {
        uiText: {
          // ui text fot translate
          feedShowMoreButton: 'show more',
          feedSearchPlaceholder: 'search',
          cardReadMoreButton: 'read more →',
          allTagsButton: 'all tags'
        },
        feedItems: {
          // global settings for feed items
          limit: 5,
          yearSeparator: false,
          yearSeparatorSkipFirst: true,
          contentTypes: {
            links: {
              beforeTitle: '🔗 '
            }
          }
        },
        feedSearch: {
          symbol: '🔍'
        }
      }
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Santi Vazquez Personal Website`,
        short_name: `SantiVazquez`,
        start_url: `/`,
        background_color: `#fff`,
        theme_color: `#3a5f7d`,
        display: `standalone`,
        icon: `src/assets/favicon.png`
      }
    },
    {
      resolve: `gatsby-plugin-sitemap`
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        // replace "UA-XXXXXXXXX-X" with your own Tracking ID
        trackingId: 'UA-154769827-1'
      }
    }
  ]
};

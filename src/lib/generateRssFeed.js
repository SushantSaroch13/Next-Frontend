import ReactDOMServer from 'react-dom/server'
import { Feed } from 'feed'
import { mkdir, writeFile } from 'fs/promises'
import { client, urlFor } from "@/lib/sanity"
import { useState, useEffect } from 'react';

export async function generateRssFeed() {
  // Fetch blog data from Sanity
  const [data, setPosts] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Run only on the client side
      async function fetchData() {
        try {
          const query = `
            *[_type == 'blog'] | order(_createdAt desc) {
              title,
              smallDescription,
              'currentSlug': slug.current,
              titleImage
            }`;
          const res = await client.fetch(query);
          setPosts(res);
          console.log("RSS Result: ", res);
        } catch (err) {
          console.log(err);
        }
      }
      fetchData();
    }
  }, []);
  const rssdata = await data.json();
  const blogs = rssdata.result;

  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  let author = {
    name: 'Sushant Saroch', // Update with your name
    email: 'sushantsaroch13@gmail.com', // Update with your email
  }

  let feed = new Feed({
    title: author.name,
    description: 'Your blog description',
    author,
    id: siteUrl,
    link: siteUrl,
    image: `${siteUrl}/favicon.icon`,
    favicon: `${siteUrl}/favicon.icon`,
    copyright: `All rights reserved ${new Date().getFullYear()}`,
    feedLinks: {
      rss2: `${siteUrl}/rss/feed.xml`,
      json: `${siteUrl}/rss/feed.json`,
    },
  })

  for (let blog of blogs) {
    let url = `${siteUrl}/article/${blog.currentSlug}`; // Adjust based on your Sanity blog URLs
    let html = ReactDOMServer.renderToStaticMarkup(
      <article.component blog={blog} isRssFeed />
    )

    feed.addItem({
      title: blog.title,
      id: url,
      link: url,
      description: blog.smallDescription,
      content: html,
      author: [author],
      contributor: [author],
      date: new Date(blog._createdAt),
    })
  }

  await mkdir('./public/rss', { recursive: true })
  await Promise.all([
    writeFile('./public/rss/feed.xml', feed.rss2(), 'utf8'),
    writeFile('./public/rss/feed.json', feed.json1(), 'utf8'),
  ])
}

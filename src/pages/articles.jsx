import Image from 'next/image'
import Head from 'next/head'

import { Card } from '@/components/Card'
import Link from 'next/link'
import { Button } from '@/components/Button'
import { SimpleLayout } from '@/components/SimpleLayout'
import { client, urlFor } from "@/lib/sanity"
import { useState, useEffect } from 'react';

export const revalidate = 30 // revalidate at most every 30 sec

const Articles = () => {
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
          console.log("result: ", res);
        } catch (err) {
          console.log(err);
        }
      }
      fetchData();
    }
  }, []);
  // console.log("Data: ",data)
  return (
    <>
      <Head>
        <title>Sushant Saroch | Articles</title>
        <meta
          name="description"
          content="Unleashing Creativity, One Thought at a Time."
        />
      </Head>
      <SimpleLayout
        title="Unleashing Creativity, One Thought at a Time."
        intro="Embark on a journey through my thought-provoking blogs, where creativity meets contemplation, and each word is a brushstroke in the canvas of ideas. Join me in exploring a universe of diverse topics, from tech insights to personal musings—where every blog is a unique piece in the mosaic of curiosity and inspiration."
      >
        <ul
          role="list"
          className="grid grid-cols-1 gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-2"
        >
          {data?.map((article, idx) => (
            <Card as="li" key={idx}>
              <div className='relative z-10  shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0'>
              <Image
                  src={urlFor(article.titleImage).url()}
                  alt="Image"
                  width={500}
                  height={500}
                  priority
                  className="rounded-t-lg h-[200px] object-cover border"
                />
              </div>
                
                <h2 className="mt-6 text-base font-semibold text-zinc-800 dark:text-zinc-100 line-clamp-2">
                <Card.Link href={`/article/${article.currentSlug}`}>{article.title}</Card.Link>
              </h2>
              <div className="mb-5 line-clamp-3 text-sm  text-gray-600 dark:text-gray-300">
              <Card.Description className="line-clamp-3 ">
              {article.smallDescription}
                </Card.Description>
              </div>
              <Button className="w-full z-10 h-auto mt-auto">
                <Link href={`/article/${article.currentSlug}`}>Read More</Link>
              </Button>
            </Card>
          ))}
        </ul>
      </SimpleLayout>
    </>
  )
}
export default Articles;
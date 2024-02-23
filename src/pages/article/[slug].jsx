import Image from 'next/image';
import { useRouter } from 'next/router';
import { client, urlFor } from "@/lib/sanity";
import { Card } from '@/components/Card'
import { SimpleLayout } from '@/components/SimpleLayout'
import { formatDate } from '@/lib/formatDate'
import { useState, useEffect } from 'react';
import { PortableText } from '@portabletext/react';
import { Container } from '@/components/Container'

export const revalidate = 30 // revalidate at most every 30 sec

const Page = () => {
    const router = useRouter();
    const slug = router.query.slug;
    const [data, setPosts] = useState({});

    useEffect(() => {
        async function fetchData() {
            try {
                const { slug } = router.query;

                if (!slug) {
                    // Handle the case when slug is undefined or null
                    console.warn('Slug is undefined or null.');
                    return;
                }

                const query = `*[_type == 'blog' && slug.current == $slug]{
                    "currentSlug": slug.current,
                    title,
                    content,
                    titleImage,
                    publishedAt
                }[0]`;
                const res = await client.fetch(query, { slug });
                setPosts(res || {});
                // console.log("result: ", res);
            } catch (err) {
                console.error(err);
            }
        };

        if (slug) {
            fetchData();
        }
    }, [slug]); // Include router.query.slug in the dependencies array

    return (
        <>
            <span className='block mt-5 text-base text-center text-primary font-semibold tracking-wide uppercase dark:invert'>
                Sushant Saroch - Blog
            </span>
            <Container className="mt-16 sm:mt-32">
                <header className="max-w-2xl">
                    <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
                        {data.title}
                    </h1>
                </header>
                <div className='mt-6'>
                    <Card.Eyebrow as="time" dateTime={data.publishedAt} decorate>
                        {formatDate(data.publishedAt)}
                    </Card.Eyebrow>
                </div>
                <div className="mt-5 sm:mt-8">
                    {data.titleImage && (
                        <Image
                            src={urlFor(data.titleImage).url()}
                            alt="Image"
                            width={500}
                            height={500}
                            className="rounded-t-lg mt-8 border"
                            priority
                        />
                    )}
                </div>
                <header className="max-w-2xl">
                    <div className="mt-6 text-base prose prose-blue prose-lg text-zinc-600 dark:text-zinc-400 dark:prose-invert">
                        <PortableText value={data.content} />
                    </div>
                </header>

            </Container>
        </>
    );
};

export default Page;

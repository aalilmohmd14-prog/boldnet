'use client';
import React from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Header from '../components/header';
import Footer from '../components/footer';
import { useLanguage } from '../context/language-context';

function BlogIndexPage() {
  const { language, t } = useLanguage();
  const firestore = useFirestore();
  
  const postsQuery = useMemoFirebase(
    () => query(collection(firestore, 'blog_posts'), orderBy('createdAt', 'desc')),
    [firestore]
  );
  const { data: posts, isLoading: isLoadingPosts } = useCollection(postsQuery);

  const renderPostCard = (post: any) => {
    const title = post.title?.[language] || post.title?.en;
    const excerpt = post.excerpt?.[language] || post.excerpt?.en;

    return (
        <Link href={`/blog/${post.slug}`} className="group block h-full">
            <Card className="flex flex-col h-full bg-black/40 backdrop-blur-sm text-white shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl">
                <div className="overflow-hidden relative rounded-t-2xl">
                    {post.imageUrl ? (
                        <Image 
                            src={post.imageUrl}
                            alt={title}
                            width={400}
                            height={250}
                            className="object-cover w-full aspect-[4/3] group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full aspect-[4/3] bg-muted"></div>
                    )}
                    {post.createdAt && (
                        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded">
                        {language === 'fr' ? format(post.createdAt.toDate(), 'd MMMM yyyy', { locale: fr }).toUpperCase() : format(post.createdAt.toDate(), 'MMMM d, yyyy').toUpperCase()}
                        </div>
                    )}
                </div>
            <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold font-headline mb-3 flex-grow text-white">{title}</h3>
                    <p className="text-white/80 line-clamp-3 mb-4">
                        {excerpt}
                    </p>
                    <span className="font-semibold tracking-widest text-sm text-red-300 group-hover:text-white transition-colors">
                        READ MORE
                    </span>
            </div>
            </Card>
        </Link>
    );
  }

  const renderContent = () => {
    if (isLoadingPosts) {
        return <p className="text-center text-white">Loading posts...</p>
    }

    if (!posts || posts.length === 0) {
        return <p className="text-center text-red-200">No blog posts available yet.</p>
    }
    
    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
                <div key={post.id} className="h-full">
                    {renderPostCard(post)}
                </div>
            ))}
        </div>
    )
  }
  
  return (
    <div className="flex flex-col min-h-dvh bg-transparent">
        <Header />
        <main className="flex-1">
            <section className="pt-32 pb-16">
                 <div className="container">
                    <h1 className="text-4xl md:text-5xl font-extrabold font-headline mb-12 text-center text-white">{t('blog')}</h1>
                    {renderContent()}
                 </div>
            </section>
        </main>
        <Footer />
    </div>
  );
}

export default BlogIndexPage;

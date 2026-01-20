'use client';
import React from 'react';
import { useLanguage } from '@/app/context/language-context';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function BlogOverview({ content }: { content: any }) {
  const { t, language } = useLanguage();
  const firestore = useFirestore();
  
  const postsQuery = useMemoFirebase(
    () => query(collection(firestore, 'blog_posts'), orderBy('createdAt', 'desc'), limit(3)),
    [firestore]
  );
  const { data: posts, isLoading: isLoadingPosts } = useCollection(postsQuery);

  const renderPostCard = (post: any) => (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
        <Card className="flex flex-col h-full bg-black/40 backdrop-blur-sm text-white shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl">
            <div className="overflow-hidden relative rounded-t-2xl">
                 {post.imageUrl ? (
                    <Image 
                        src={post.imageUrl}
                        alt={post.title}
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
                <h3 className="text-xl font-bold font-headline mb-3 flex-grow text-white">{post.title}</h3>
                <p className="text-white/80 line-clamp-3 mb-4">
                    {post.excerpt}
                </p>
                 <span className="font-semibold tracking-widest text-sm text-red-300 group-hover:text-white transition-colors">
                    READ MORE
                </span>
           </div>
        </Card>
    </Link>
  );

  const renderContent = () => {
    if (isLoadingPosts) {
        return <p className="text-center text-white">Loading posts...</p>
    }

    if (!posts || posts.length === 0) {
        return <p className="text-center text-red-200">No blog posts available yet.</p>
    }
    
    return (
        <div className="grid justify-items-center md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
                <div key={post.id} className={cn(
                    "w-full max-w-md",
                    posts.length === 1 && "md:col-span-2 lg:col-span-3 flex justify-center",
                    posts.length === 2 && "md:col-span-1 lg:col-span-1"
                )}>
                   <div className={cn(posts.length === 1 ? "max-w-md" : "w-full", "h-full")}>
                    {renderPostCard(post)}
                   </div>
                </div>
            ))}
        </div>
    )
  }
  
  return (
    <section 
        id="blog" 
        className="w-full py-12 md:py-24 lg:py-32 bg-transparent text-white"
    >
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl font-headline">
              {content?.title || 'From the Blog'}
            </h2>
            <p className="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-red-200">
              {content?.subtitle || 'Check out our latest articles and insights.'}
            </p>
          </div>
        </div>
        <div className="mt-12">
            {renderContent()}
        </div>
        <div className="text-center mt-12">
            <Button asChild variant="outline" className="bg-transparent text-white border-white/50 hover:bg-white/10">
                <Link href="/blog">
                    Voir tous les articles <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
      </div>
    </section>
  );
}

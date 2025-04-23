import { NavLink, useNavigate, useParams, useSearchParams } from "react-router";
import BaseLayout from "../layouts/Base";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import Axios from "../utils/Axios";

const Archive = () => {
    let { termId } = useParams();
    let [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [postArgs] = useState<{
        page: number
        per_page: number
        tags: any[]
    }>({
        page: 1,
        per_page: 100,
        tags: [termId],
    });

    // posts
    const { isLoading, isSuccess, data } = useQuery({
        queryKey: ['posts'],
        queryFn: async () => {
            const postType = searchParams.get('post_type');
            const { data } = await Axios.get(`/wp/v2/${postType}s`, {
                params: postArgs,
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            return data;
        }
    });
    
    return (
        <BaseLayout>
            <div className="flex items-center gap-2 text-2xl border-b border-neutral-300 pb-2">
                <button type="button" className="px-2 py-1" onClick={() => navigate(-1)}>
                    {'<'}
                </button>

                {'Tags: '}{searchParams.get('term')}
            </div>

            {isLoading ? (
                <div className="block">
                    {'Loading...'}
                </div>
            ) : null}

            {isSuccess ? (
                <div className="block">
                    {data.length > 0 ? (
                        <ul className="Notelist">
                            {data.map((post: any, index: number) => (
                                <li key={post.id} className="text-lg py-4 flex">
                                    <div className="w-8 h-8 flex-none mt-1">
                                        <div className="items-center justify-center flex h-full w-full border border-lime-300 bg-lime-100 font-bold">{index + 1}</div>
                                    </div>
                                    <div className="w-full pl-4">
                                        <h3 className="hidden text-xl font-semibold">{post.title.rendered}</h3>
                                        
                                        <div className="flex">
                                            <div className="block font-semibold">{format(post.date, 'dd MMMM yyyy HH:mm')}</div>
                                            <div className="ml-auto">
                                                <NavLink className={'text-blue-700 text-sm'} to={{ pathname: '/', search: `?pid=${post.id}&type=${post.type}` }}>{'Edit'}</NavLink>
                                            </div>
                                        </div>

                                        <div className="block Content ck-content formatted p-4 bg-neutral-200 mt-2" dangerouslySetInnerHTML={{ __html: post.content.rendered }}></div>
                                        {post.tags.length > 0 ? (
                                            <ul className="flex flex-wrap gap-2 mt-2">
                                                {post.tags.map((tag: any) => (
                                                    <li key={tag.term_id}>
                                                        <span className="px-2 py-0.5 rounded-full border border-neutral-400 cursor-pointer">{tag.name}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : null}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div>{'Note for selected date not found.'}</div>
                    )}
                </div>
            ) : null}
        </BaseLayout>
    )
}

export default Archive;
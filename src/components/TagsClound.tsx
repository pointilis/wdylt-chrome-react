import { useMutation } from "@tanstack/react-query";
import Axios from "../utils/Axios";
import { useEffect } from "react";
import { NavLink } from "react-router";

const TagsCloud = (props: {
    postType: string[]
}) => {
    
    const getTagsMutation = useMutation({
        mutationFn: async (variables: any) => {
            const params = {
                page: 1,
                per_page: 100,
                hide_empty: false,
                orderby: 'count',
                order: 'desc',
                post_type: variables.post_type,
            }

            const { data } = await Axios.get(`/wp/v2/tags`, {
                params: params,
            });

            return data;
        }
    });

    useEffect(() => {
        getTagsMutation.mutate({ post_type: props.postType })
    }, []);

    return (
        <div> 
            {getTagsMutation.isPending ? (
                <div>{'Loading...'}</div>
            ) : null}

            {getTagsMutation.isSuccess ? (
                <ul>
                    {getTagsMutation.data.map((tag: any) => {
                        return (
                            <li key={tag.id} className="inline-block mr-2 mb-1.5">
                                <NavLink to={{ pathname: `/tags/${tag.id}`, search: `?term=${tag.name}&post_type=${props.postType[0]}` }} end>
                                    <h3 className="text-sm gap-1 flex px-2 py-0.5 border border-blue-400 text-blue-600 rounded-full">
                                        {tag.name}
                                        <span>&bull;</span>
                                        <span className="ml-auto">{tag.count}</span>
                                    </h3>
                                </NavLink>
                            </li>
                        )
                    })}
                </ul>
            ) : null}
        </div>
    )
}

export default TagsCloud;
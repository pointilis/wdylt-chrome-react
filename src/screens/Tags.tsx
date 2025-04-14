import { useQuery } from "@tanstack/react-query";
import BaseLayout from "../layouts/Base";
import { NavLink, Outlet } from "react-router";
import Axios from "../utils/Axios";

const Tags = () => {
    // tags
    const { isLoading, isSuccess, data } = useQuery({
        queryKey: ['tags'],
        queryFn: async () => {
            const { data } = await Axios.get('/wp/v2/tags', {
                params: {
                    page: 1,
                    per_page: 100,
                    hide_empty: false,
                    orderby: 'count',
                    order: 'desc',
                },
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            return data;
        }
    });

    return (
        <BaseLayout>
            <Outlet />

            {isLoading ? (
                <div className="block">
                    {'Loading...'}
                </div>
            ) : null}

            {isSuccess ? (
                <div className="block">
                    {data.length > 0 ? (
                        <ul className="Notelist">
                            {data.map((tag: any) => (
                                <li key={tag.id} className="text-lg py-2">
                                    <NavLink to={{ pathname: '/tags/' + tag.id, search: '?term=' + tag.name }} end>
                                        <h3 className="text-lg flex">
                                            {tag.name}
                                            <span className="ml-auto">{tag.count}</span>
                                        </h3>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div>{'Your tags is empty.'}</div>
                    )}
                </div>
            ) : null}
        </BaseLayout>
    )
}

export default Tags;
import Post from "./Post.jsx";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const Posts = ({feedType, username, userID}) => {
	const getPostEndPoint = () => {
		switch(feedType) {
			case "forYou":
				return '/api/posts/forYou';
			case 'following':
				return '/api/posts/following';
			case 'posts':
				return `/api/posts/users/${username}`;
			case 'likes':
				return `/api/posts/likes/${userID}`;
			case 'saved':
				return `/api/posts/saved/${userID}`;
			default:
				return '/api/posts/forYou';
		}
	};
	const postEndPoint = getPostEndPoint();
	const { data: posts , isLoading, refetch, isRefetching } = useQuery({
		queryKey: ['posts'],
		queryFn: async () => {
			try {
				const res = await fetch(postEndPoint);
				const data = await res.json();
				if(!res.ok) {
					throw new Error(data.error || 'Something went wrong!');
				}
				return data;
			}
			catch(error) {
				throw new Error(error.message);
			}
		}
	}); 
	useEffect(()=> {
		if(posts !== undefined) {
			console.log('refetching');
			refetch();
		}
	}, [feedType, refetch , username, posts]);
	return (
		<>
			{(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{(!isLoading || !isRefetching)&& posts?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{(!isLoading || !isRefetching) && posts && (
				<div>
					{posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;
import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaBookmark } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../../util/date";

const Post = ({ post }) => {
	const [comment, setComment] = useState("");
	const {data: authUser} = useQuery({
		queryKey: ['authUser']
	});
	const postID = post._id;
	const queryClient = useQueryClient();
	const isLiked = post.likes.includes(authUser._id);
	const isSaved = post.saves.includes(authUser._id);
	const {mutate: deletePost, isPending: isDeleting} = useMutation({
		mutationFn: async() => {
			try {
				const res = await fetch(`/api/posts/${postID}`, {
					method: 'DELETE',
				});
				const data = await res.json();
				if(!res.ok) {
					throw new Error(data.error.message || 'Failed to delete post');
				}
			}
			catch(error) {
				throw new Error(error.message);
			}
	},
	onSuccess: () => {
		queryClient.invalidateQueries({querKey:['posts']});
		toast.success('Post deleted successfully');
	}
});
	const {mutate: likePost, isPending: isLiking } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch(`/api/posts/likes/${postID}`, {
					method: 'POST',
				});
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error.message || 'Failed to like post');
				}
				return data;
			} 
			catch(error) {
				throw new Error(error.message);
			}
			},
			onSuccess: (updatedLikes) => {
				queryClient.setQueryData(['posts'], (oldData) => {
					return oldData.map((oldPost) => {
						if(oldPost._id === postID) {
							return {...oldPost, likes: updatedLikes}
						}
						return oldPost;
					});
				});
			},
			onError: (error) => {
				toast.error(error.message);
			}
		});
	const {mutate: commentOnPost, isPending: isCommenting} = useMutation({
		mutationFn : async () => {
			try {
				const res = await fetch(`/api/posts/comment/${postID}`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ text: comment }),
				});
				const data = await res.json();
				if(!res.ok) {
					throw new Error(data.error || 'Failed to comment');
				}
				return data;
			} 
			catch (error) {
				throw new Error(error.message);
			}
		},
		onSuccess: (updatedComments) => {
			toast.success('Comment posted successfully');
			queryClient.invalidateQueries(['posts']);
			/*queryClient.setQueryData(['posts'], (oldData) => {
				return oldData.map(oldPost => {
					if(oldPost._id === postID) {
						return {...oldPost, comments: updatedComments};
					}
					return oldPost;
				});
			});*/
			setComment('');
		},
		onError: (error) => {
			toast.error(error.message);
		}
	})
	const { mutate: deleteComment, isPending: isDeletingComment } = useMutation({
		mutationFn: async (commentID) => {
			try {
				const res = await fetch(`/api/posts/comment/${postID}`, {
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ commentID })
				});
				const data = await res.json();
				if(!res.ok) {
					throw new Error(data.error || 'Failed to delete comment');
				}
				return data;
			}
			catch(error) {
				throw new Error(error.message);
			}
		},
		onSuccess: (updatedComments) => {
			toast.success('Comment deleted');
			queryClient.invalidateQueries(['posts']);
			/*queryClient.setQueryData(['posts'], (oldData) => {
				return oldData.map((oldPost) => {
					if(oldPost._id === postID) {
						return {...oldPost, comments: updatedComments};
					}
					return oldPost;
				});
			}
		);*/
		},
		onError: (error) => {
			toast.error(error.message);
		}
	});
	const { mutate: savePost, isPending: isSaving} = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch(`/api/posts/saved/${postID}`, {
					method: 'POST'
				});
				const data = await res.json();
				if(!res.ok) {
					throw new Error(data.error || 'Something went wrong');
				}
				return data;
			} 
			catch (error) {
				throw new Error(error.message);
			}
		},
		onSuccess: (updatedSaved) => {
			if(isSaved) {
				toast.success('Post unsaved');
			}
			else {
				toast.success('Post saved😁');
			}
			queryClient.setQueryData(['posts'], (oldData) => {
				return oldData.map((oldPost) => {
					if(oldPost._id === postID) {
						return {...oldPost, saves: updatedSaved};
					}
					return oldPost;
				})
			}),
			queryClient.invalidateQueries(['authUser']);
		},
		onError: (error) => {
			toast.error(`Failed to save post: ${error}`);
		}
	})
	const postOwner = post.user;
	

	const isMyPost = authUser._id === post.user._id;
	
	const formattedDate = formatPostDate(post.createdAt);

	const handleDeletePost = async () => {
		deletePost();
	};

	const handlePostComment = (e) => {
		e.preventDefault();
		if(isCommenting) {
			return;
		}
		commentOnPost();
	};
	const handleDeleteComment = async (commentID) => {
		if(isDeletingComment) {
			return;
		}
		deleteComment(commentID);
	}
	const handleLikePost = () => {
		if(isLiking) {
			return;
		}
		likePost();
	};
	const handleSavePost = () => {
		if(isSaving) {
			return;
		}
		savePost();

	}

	return (
		<>
			<div className='flex gap-2 items-start p-4 border-b border-gray-700'>
				<div className='avatar'>
					<Link to={`/profile/${postOwner.username}`} className='w-8 h-8 rounded-full overflow-hidden'>
						<img src={postOwner.profilePic || "/avatar-placeholder.png"} />
					</Link>
				</div>
				<div className='flex flex-col flex-1'>
					<div className='flex gap-2 items-center'>
						<Link to={`/profile/${postOwner.username}`} className='font-bold'>
							{postOwner?.fullName}
						</Link>
						<span className='text-gray-700 flex gap-1 text-sm'>
							<Link to={`/profile/${postOwner.username}`}>@{postOwner.username}</Link>
							<span>·</span>
							<span>{formattedDate}</span>
						</span>
						{isMyPost && (
							<span className='flex justify-end flex-1'>
								{!isDeleting && <FaTrash className='cursor-pointer hover:text-red-500' onClick={handleDeletePost} />}
								{isDeleting && <LoadingSpinner size='sm' />}
							</span>
						)}
					</div>
					<div className='flex flex-col gap-3 overflow-hidden'>
						<span>{post.text}</span>
						{post.img && (
							<img
								src={post.img}
								className='h-80 object-contain rounded-lg border border-gray-700'
								alt=''
							/>
						)}
					</div>
					
					<div className='flex justify-between mt-3'>
						
						<div className='flex gap-4 items-center w-2/3 justify-between'>
						<div className='flex gap-1 items-center group cursor-pointer' onClick={handleLikePost}>
								{isLiking && <LoadingSpinner size='sm' />}
								{!isLiked && !isLiking && (
									<FaRegHeart className='w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500' />
								)}
								{isLiked && <FaRegHeart className='w-4 h-4 cursor-pointer text-pink-500 ' />}

								<span
									className={`text-sm text-slate-500 group-hover:text-pink-500 ${
										isLiked ? "text-pink-500" : ""
									}`}
								>
									{post.likes.length}
								</span>
							</div>
							<div
								className='flex gap-1 items-center cursor-pointer group'
								onClick={() => document.getElementById("comments_modal" + post._id).showModal()}
							>
								<FaRegComment className='w-4 h-4  text-slate-500 group-hover:text-sky-400' />
								<span className='text-sm text-slate-500 group-hover:text-sky-400'>
									{post.comments.length}
								</span>
							</div>
							{/* We're using Modal Component from DaisyUI */}
							<dialog id={`comments_modal${post._id}`} className='modal border-none outline-none'>
								<div className='modal-box rounded border border-gray-600'>
									<h3 className='font-bold text-lg mb-4'>COMMENTS</h3>
									<div className='flex flex-col gap-3 max-h-60 overflow-auto'>
										{post.comments.length === 0 && (
											<p className='text-sm text-slate-500'>
												No comments yet 🤔 Be the first one 😉
											</p>
										)}
										{post.comments.map((comment) => {
											if(comment.user._id !== authUser._id) {
										return(
											<div key={comment._id} className='flex gap-2 items-start'>
												<div className='avatar'>
													<div className='w-8 rounded-full'>
														<img
															src={comment.user.profilePic || "/avatar-placeholder.png"}
														/>
													</div>
												</div>
												<div className='flex flex-col'>
													<div className='flex items-center gap-1'>
														<span className='font-bold'>{comment.user.fullName}</span>
														<span className='text-gray-700 text-sm'>
															@{comment.user.username}
														</span>
													</div>
													<div className='text-sm'>{comment.text}</div>
												</div>
											</div>)} else {
												return(<div key={comment._id} className='flex gap-2 items-start'>
													<div className='avatar'>
														<div className='w-8 rounded-full'>
															<img
																src={comment.user.profilePic || "/avatar-placeholder.png"}
															/>
														</div>
													</div>
													<div className='flex flex-col'>
														<div className='flex items-center gap-1'>
															<span className='font-bold'>{comment.user.fullName}</span>
															<span className='text-gray-700 text-sm'>
																@{comment.user.username}
															</span>
															<div className='flex justify-end flex-1'><FaTrash className='cursor-pointer hover:text-red-500' onClick={(e)=> {
																e.preventDefault()
																handleDeleteComment(comment._id)}}/></div>
														</div>
														<div className='text-sm'>{comment.text}</div>
													</div>
												</div>)
											}
})}
									</div>
									<form
										className='flex gap-2 items-center mt-4 border-t border-gray-600 pt-2'
										onSubmit={handlePostComment}
									>
										<textarea
											className='textarea w-full p-1 rounded text-md resize-none border focus:outline-none  border-gray-800'
											placeholder='Add a comment...'
											value={comment}
											onChange={(e) => setComment(e.target.value)}
										/>
										<button className='btn btn-primary rounded-full btn-sm text-white px-4'>
											{isCommenting ? (
												<span className='loading loading-spinner loading-md'></span>
											) : (
												"Post"
											)}
										</button>
									</form>
								</div>
								<form method='dialog' className='modal-backdrop'>
									<button className='outline-none'>close</button>
								</form>
							</dialog>
						</div>
						<div className='flex w-1/3 justify-end gap-2 items-center'>
							{isSaved ? <FaBookmark className='w-4 h-4 text-slate-500 cursor-pointer' onClick={handleSavePost}/> :<FaRegBookmark className='w-4 h-4 text-slate-500 cursor-pointer' onClick={handleSavePost} />}
							{isSaving && <LoadingSpinner size='sm' />}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
export default Post;
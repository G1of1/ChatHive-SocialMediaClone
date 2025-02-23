import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import useFollow from "../../hooks/useFollow";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const FollowingPage = () => {
    const { data: authUser } = useQuery({queryKey: ['authUser']});
    const { username } = useParams();
    const {data : users } = useQuery({
        queryKey: ['following'],
        queryFn: async () => {
            try {
                const res = await fetch(`/api/users/following/${username}`);
                const data = await res.json();
                if(!res.ok) {
                    throw new Error(data.error || "Something went wrong.")
                }
                return data;
            }
            catch(error) {
                throw new Error(error.message);
            }
        }
    });
    const {follow, isPending: isFollowing} = useFollow();
    const [text, setText] = useState('');
        const filteredUsers = users?.filter(user =>
            user.username.toLowerCase().includes(text.toLowerCase()) ||
            user.fullName.toLowerCase().includes(text.toLowerCase())
        );
    return(
        <>
			<div className='flex-[4_4_0] border-l border-r border-gray-700 min-h-screen items-center'>
				<div className='flex justify-between items-center p-4 border-b border-gray-700'>
					<p className=' flex font-bold text-center items-center text-2xl'>Following</p>
                    <input
                    className='p-2 rounded-full text-center'
                    value={text}
                    placeholder='Search...'
                    onChange={(e) => setText(e.target.value)}
                    />
				</div>
				{filteredUsers?.length === 0 && <div className='text-center p-4 font-bold'>No followers 🤔</div>}
				{filteredUsers?.map((user) => (
					<div className=' border-l-gray-700 border-r-gray-700' key={user._id}>
						<div className='flex gap-2 p-4'>
					
							<Link to={`/profile/${user.username}`}>
								<div className='avatar'>
									<div className='w-8 rounded-full'>
										<img src={user.profilePic || "/avatar-placeholder.png"} />
									</div>
								</div>
                                <div className='flex gap-1'>
                                <span className='font-bold'>{user.fullName}</span>
                                </div>
								<div className='flex gap-1'>
                                    
									<span className=''>@{user.username}</span>{" "}
								</div>
                                
							</Link>
                                {
                                    !isFollowing ? <button className='btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm' onClick={() => follow(user._id)}>Unfollow</button> :
                                    <button className='btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm'><LoadingSpinner size='sm' /></button>
                                }
						</div>
					</div>
				))}
			</div>
		</>
    )
}

export default FollowingPage;

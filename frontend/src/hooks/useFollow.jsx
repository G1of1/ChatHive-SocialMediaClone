import toast from "react-hot-toast";
import { useMutation , useQuery, useQueryClient } from '@tanstack/react-query'
//Used for following
const useFollow = () => {
    const queryClient = useQueryClient();
    const {data : authUser} = useQuery({queryKey: ['authUser']});
    const {mutate: follow, isPending} = useMutation({
        mutationFn: async (userID) => {
            try {
                const res = await fetch(`/api/users/follow/${userID}`, {
                    method: 'POST'
                });
                const data = await res.json();
                if(!res.ok) {
                    throw new Error(data.message || 'Something went wrong!');
                }
                return data;
        }
        catch(error) {
            throw new Error(error.message);
        }
        },
        onSuccess: (data) => {
            const isFollowing = authUser.following.includes(data._id);
            if(isFollowing) {
                toast.success(`You have unfollowed ${data.username}😔`);
            }
            else {
                toast.success(`You are now following ${data.username}😁`);
            }
            Promise.all([
            queryClient.invalidateQueries({querKey: ['suggestedUsers']}),
            queryClient.invalidateQueries({querKey: ['authUser']}),
        ]);
        },
        onError: (error) => {
            toast.error(error.message);
        }
    })
    return { follow, isPending };
}

export default useFollow;
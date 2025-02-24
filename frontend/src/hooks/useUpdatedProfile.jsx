import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
//For for updating profile
export const useUpdatedProfile = () => {
    const queryClient = useQueryClient();
    const {mutateAsync: updateProfile, isPending: isUpdating} = useMutation({
            mutationFn: async(formData) => {
                try{
                const res = await fetch('/api/users/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json', 
                    },
                        body: JSON.stringify(formData)
                    }
                );
                const data = await res.json();
                if(!res.ok) {
                    throw new Error(data.error || 'Something went wrong');
                }
                return data;
            }
            catch(error) {
                throw new Error(error.message);
            }
            },
            onSuccess: () => {
                toast.success('Profile updated!');
                Promise.all([
                    queryClient.invalidateQueries(['authUser']),
                    queryClient.invalidateQueries(['userProfile'])
                ])
            },
            onError: (error) => {
                toast.error(error.message);
            }
        });
        return {updateProfile, isUpdating};
}
export const formatPostDate = (date) => {
    const currentDate = new Date();
    const postDate = new Date(date);

    const timeDiffSeconds = Math.floor((currentDate - postDate) / 1000);
    const timeDiffMinutes = Math.floor(timeDiffSeconds / 60);
    const timeDiffHours = Math.floor(timeDiffMinutes / 60);
    const timeDiffDays = Math.floor(timeDiffHours / 24);

    if(timeDiffDays > 1) {
        return postDate.toLocaleDateString("en-US", { month: 'short', day: 'numeric'});
    }
    else if(timeDiffDays === 1) {
        return '1d';
    }
    else if(timeDiffHours > 1) {
        return `${timeDiffHours}h`;
    }
    else if(timeDiffMinutes >= 1) {
        return `${timeDiffMinutes}m`;
    }
    else{
        return `${timeDiffSeconds}s`;
    }

}
export const MemberSince = (date) => {
    const thedate = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[thedate.getMonth()];
    const year = thedate.getFullYear();
    return `Joined ${month} ${year}`;
}
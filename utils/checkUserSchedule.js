const User = require('../models/User');
const Group = require('../models/Group');
const checkSchedule = async (userId, meetingTime) => {
    const user = await User.findById(userId);
    const groups = user.groups;
    for (let i = 0; i < groups.length; i++) {
        const group = await Group.findById(groups[i]);
        meetingTime.days.forEach((day) => {
            if (group.meetingTime.days.includes(day)) {
                if (
                    group.meetingTime.start <= meetingTime.start &&
                    meetingTime.start <=
                        group.meetingTime.start + group.meetingTime.last / 60 // Check if the meeting time is in the range of the group's meeting time
                ) {
                    return false;
                }
                if (
                    meetingTime.start <= group.meetingTime.start &&
                    group.meetingTime.start <=
                        meetingTime.start + meetingTime.last / 60 // Check if the group's meeting time is in the range of the meeting time
                ) {
                    return false;
                }
            }
        });
    }
    return true;
};
module.exports = checkSchedule;

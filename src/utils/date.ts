export const getCurrentMonthRange = () => {
    const now = new Date();

    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const format = (date: Date) =>
        date.toISOString().split("T")[0];

    return {
        start_date: format(start),
        end_date: format(end),
    };
};

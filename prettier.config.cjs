/** @type {import("prettier").Config} */
module.exports = {
    arrowParensL: "avoid",
    tabWidth: 4,
    plugins: [require.resolve("prettier-plugin-tailwindcss")],
};

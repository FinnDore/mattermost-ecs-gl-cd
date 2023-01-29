/** @type {import("prettier").Config} */
module.exports = {
    arrowParens: "avoid",
    tabWidth: 4,
    plugins: [require.resolve("prettier-plugin-tailwindcss")],
};

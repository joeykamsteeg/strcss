const { Constants, Sheet } = require('./')

console.log ('\n\x1b[47m\x1b[30m============================================\n============== UTSEENDE TEST ===============\n\x1b[0m')

Constants.set({
    'fontSize': '10',
    'textColor': 'green'
})

let sheet = new Sheet(`
    container
        position fixed
        rect stretch
        order 10
        gradient 20 #fff #191919
        shadow 10 20
    user
        margin 20 10
        font-size $fontSize
        text-color $textColor
        rect fit
    test
        rect 10
    test2
        rect 10 20
    test3
        rect 10 20 30
    test4
        rect 10 20 30 40
    :hover
        text-color red
`);

console.log(sheet.sheetText)
console.log ('\n')
console.log(sheet.css)
console.log ('\n')
console.log(sheet.map)
console.log ('\n')
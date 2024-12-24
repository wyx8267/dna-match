export const transformOptions = [
    {value: 'none', label: '不转换'},
    {value: 'common', label: '通用转换（>开头）'},
]

export const transformMap = {
    none: (value) => value,
    common: (value) => value.replace(/^>.+\n*/gm, ''),
}

import localIpUrl from 'local-ip-url';

export const PORT = 3333;

console.log(localIpUrl('public'))

export const ADDRESS = localIpUrl('public') || 'localhost';

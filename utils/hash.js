import bcrypt from 'bcrypt';


export async function hashage(password){
    const saltRounds=10;
    return await bcrypt.hash(password, saltRounds);
};


export async function compareHash(password, passwordHashe){
    return await bcrypt.compare(password, passwordHashe);
}



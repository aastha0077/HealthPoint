interface LoginType {
    email: string
    password: string
}


interface SignupType {
    email: string
    firstName: string,
    lastName: string,
    password: string,
    contactNumber: string,
    district: string
    municipality: string
    wardNo: string
    address: string
    role: string
}



export { LoginType, SignupType }
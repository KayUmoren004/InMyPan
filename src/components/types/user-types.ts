import { User } from "firebase/auth";

export interface UserProfile {
  id: string;
  email: string;
  displayName?: {
    givenName?: string;
    familyName?: string;
    middleName?: string;
    nickname?: string;
    namePrefix?: string;
    nameSuffix?: string;
  } | null;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
  provider?: string;
  username?: string;

  location?: string;
  link?: string;
  work?: string;
  education?: string;
  bio?: string;
}

export interface AuthUser extends UserProfile {
  firebaseUser: User;
}

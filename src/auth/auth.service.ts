import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { PasswordHelper } from 'src/common/helpers/password-helper';
import { AuthorizationService } from '../authorization/authorization.service'; // Ensure this service exists

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly authorizationService: AuthorizationService,
  ) { }

  // Login and generate JWT token
  async login(email: string, password: string) {
    const user = await this.userService.getUserByEmail(email);
    console.log("User fetched in login:", user); 
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await PasswordHelper.validatePassword(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    // Validate role and permissions dynamically
    const rolePermissions = await this.authorizationService.getPermissionsForRole(user.roleId);
    /*  if (!rolePermissions || rolePermissions.length === 0) {
       throw new UnauthorizedException('User has no valid role or permissions');
     } */

    const payload = { sub: user.id, username: user.email, role: user?.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign({ sub: user.id }, { expiresIn: '7d' });

    // Hash and store the refresh token
    const hashedRefreshToken = await PasswordHelper.hashPassword(refreshToken);
    await this.userService.updateUser(user.id, { refreshToken: hashedRefreshToken });

    return { accessToken, refreshToken };
  }

  // Validate token payload
  async validateUser(payload: { sub: string; email: string; roleId: string }) {
    
    const user = await this.userService.getUserById(payload.sub);

    const { password, ..._user } = user
    if (!user) throw new UnauthorizedException('Invalid token payload');

   /*  // Revalidate role and permissions dynamically
    const rolePermissions = await this.authorizationService.getPermissionsForRole(user.roleId);
    if (!rolePermissions || rolePermissions.length === 0) {
      throw new UnauthorizedException('User has no valid role or permissions');
    }
 */

    return _user;
  }


  // Request password reset
  async requestPasswordReset(email: string) {
    const user = await this.userService.getUserByEmail(email);
    if (!user) throw new UnauthorizedException('User not found');

    const resetToken = this.jwtService.sign({ sub: user.id }, { expiresIn: '15m' });

    // TODO: Send the resetToken via email
    console.log(`Password reset token for ${email}: ${resetToken}`);
    return { message: 'Password reset email sent', resetToken };
  }

  // Reset the password
  async resetPassword(resetToken: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(resetToken);
      const user = await this.userService.getUserById(payload.sub);
      console.log("User fetched in refreshToken:", user); 

      if (!user) throw new UnauthorizedException('Invalid token');

      const hashedPassword = await PasswordHelper.hashPassword(newPassword);
      await this.userService.updateUser(user.id, { password: hashedPassword });
      return { message: 'Password successfully reset' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // Refresh the access token
  async refreshToken(userId: string, refreshToken: string) {
    const user = await this.userService.getUserById(userId);
    if (!user || !user.refreshToken) throw new UnauthorizedException('Invalid refresh token');

    const isTokenValid = await PasswordHelper.validatePassword(refreshToken, user.refreshToken);
    if (!isTokenValid) throw new UnauthorizedException('Invalid refresh token');

    // Revalidate role and permissions dynamically
    const rolePermissions = await this.authorizationService.getPermissionsForRole(user.roleId);
    if (!rolePermissions || rolePermissions.length === 0) {
      throw new UnauthorizedException('User has no valid role or permissions');
    }

    const newAccessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
    });

    return { accessToken: newAccessToken };
  }

  async me(userId: string) {

    const user = await this.userService.getUserById(userId);

    const { password, ..._user } = user
    if (!user) throw new UnauthorizedException('Invalid token payload');

   /*  // Revalidate role and permissions dynamically
    const rolePermissions = await this.authorizationService.getPermissionsForRole(user.roleId);
    if (!rolePermissions || rolePermissions.length === 0) {
      throw new UnauthorizedException('User has no valid role or permissions');
    }
 */

    return _user;
  }
}

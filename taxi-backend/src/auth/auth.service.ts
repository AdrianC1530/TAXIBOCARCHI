import { Injectable, OnModuleInit, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService implements OnModuleInit {
  private db: admin.firestore.Firestore;

  constructor(private readonly jwtService: JwtService) {}

  async onModuleInit() {
    // Inicializar Firebase si no ha sido inicializado
    if (!admin.apps.length) {
      const serviceAccount = require(path.join(process.cwd(), '../firebase_credentials.json'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    this.db = admin.firestore();
    console.log('Firebase conectado en AuthService');

    // Crear usuario administrador por defecto si la colección usuarios está vacía
    await this.crearUsuarioAdminPorDefecto();
  }

  private async crearUsuarioAdminPorDefecto() {
    try {
      const usersRef = this.db.collection('usuarios');
      const snapshot = await usersRef.limit(1).get();
      
      if (snapshot.empty) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await usersRef.add({
          username: 'admin',
          password: hashedPassword,
          name: 'Administrador Principal',
          role: 'admin',
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Usuario admin por defecto creado: admin / admin123');
      }
    } catch (error) {
      console.error('Error al crear usuario por defecto:', error);
    }
  }

  async register(username: string, pass: string, name: string) {
    const usersRef = this.db.collection('usuarios');
    const query = await usersRef.where('username', '==', username).get();

    if (!query.empty) {
      throw new BadRequestException('El usuario ya existe');
    }

    const hashedPassword = await bcrypt.hash(pass, 10);
    const newUser = {
      username,
      password: hashedPassword,
      name,
      role: 'user',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await usersRef.add(newUser);
    return { id: docRef.id, username, name };
  }

  async registerDriver(nombre: string, apellido: string, unidad: string, pass: string) {
    const usersRef = this.db.collection('usuarios');
    // Usaremos el número de unidad como username
    const username = unidad;
    const query = await usersRef.where('username', '==', username).get();

    if (!query.empty) {
      throw new BadRequestException('El número de unidad ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(pass, 10);
    const newUser = {
      username,
      password: hashedPassword,
      name: `${nombre} ${apellido}`,
      unidad,
      role: 'driver',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await usersRef.add(newUser);
    return { id: docRef.id, username, name: newUser.name };
  }

  async getPendingDrivers() {
    const usersRef = this.db.collection('usuarios');
    const snapshot = await usersRef
      .where('role', '==', 'driver')
      .where('status', '==', 'pending')
      .get();

    const pendingDrivers: any[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      pendingDrivers.push({
        id: doc.id,
        username: data.username,
        name: data.name,
        unidad: data.unidad,
        createdAt: data.createdAt
      });
    });

    return pendingDrivers;
  }

  async updateDriverStatus(id: string, status: string) {
    const userRef = this.db.collection('usuarios').doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new NotFoundException('Taxista no encontrado');
    }

    await userRef.update({ status });
    return { id, status };
  }

  async login(username: string, pass: string) {
    const usersRef = this.db.collection('usuarios');
    const query = await usersRef.where('username', '==', username).get();

    if (query.empty) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const userDoc = query.docs[0];
    const user = userDoc.data();

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Verificar si es taxista y su estado
    if (user.role === 'driver' && user.status === 'pending') {
      throw new UnauthorizedException('Cuenta pendiente de aprobación por el administrador');
    }

    const payload = { 
      sub: userDoc.id, 
      username: user.username, 
      name: user.name,
      role: user.role 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: userDoc.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    };
  }

  async validateUserById(userId: string) {
    const userDoc = await this.db.collection('usuarios').doc(userId).get();
    if (!userDoc.exists) {
      return null;
    }
    const data = userDoc.data();
    if (!data) return null;
    return {
      id: userDoc.id,
      username: data.username,
      name: data.name,
      role: data.role
    };
  }
}

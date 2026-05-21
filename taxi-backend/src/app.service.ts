import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Injectable()
export class AppService implements OnModuleInit {
  private db: admin.firestore.Firestore;

  onModuleInit() {
    // Inicializar Firebase
    const serviceAccount = require(path.join(process.cwd(), '../firebase_credentials.json'));
    
    // Evitar inicializar multiples veces si se recarga
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    
    this.db = admin.firestore();
    console.log('Firebase conectado en NestJS AppService');
  }

  async getDetecciones() {
    try {
      const snapshot = await this.db.collection('detecciones')
        .orderBy('fecha_hora', 'asc')
        .limit(100)
        .get();
        
      const detecciones: any[] = [];
      snapshot.forEach(doc => {
        detecciones.push({
          id: doc.id,
          ...doc.data()
        });
      });
      return detecciones;
    } catch (error) {
      console.error("Error obteniendo detecciones:", error);
      return [];
    }
  }

  async getDeteccionLatest() {
    try {
      const snapshot = await this.db.collection('detecciones')
        .orderBy('fecha_hora', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error("Error obteniendo última detección:", error);
      return null;
    }
  }

  async getDeteccionesFiltradas(startDate?: string, endDate?: string, limit: number = 50, page: number = 1) {
    try {
      let query: admin.firestore.Query = this.db.collection('detecciones');

      if (startDate) {
        query = query.where('timestamp', '>=', `${startDate} 00:00:00`);
      }
      if (endDate) {
        query = query.where('timestamp', '<=', `${endDate} 23:59:59`);
      }

      // Ordenamos por timestamp desc (los más recientes primero en la tabla)
      query = query.orderBy('timestamp', 'desc');

      const totalSnapshot = await query.get();
      const total = totalSnapshot.size;

      const offset = (page - 1) * limit;
      const snapshot = await query.limit(Number(limit)).offset(Number(offset)).get();

      const data: any[] = [];
      snapshot.forEach(doc => {
        data.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        data,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error("Error filtrando detecciones:", error);
      return { data: [], total: 0, page: Number(page), limit: Number(limit), totalPages: 0 };
    }
  }

  async getSettings() {
    try {
      const doc = await this.db.collection('configuracion').doc('actual').get();
      if (!doc.exists) {
        const defaultSettings = {
          umbral_preventivo: 3,
          umbral_definitivo: 4,
          tiempo_espera_segundos: 60
        };
        await this.db.collection('configuracion').doc('actual').set(defaultSettings);
        return defaultSettings;
      }
      return doc.data();
    } catch (error) {
      console.error("Error al obtener configuraciones:", error);
      return { umbral_preventivo: 3, umbral_definitivo: 4, tiempo_espera_segundos: 60 };
    }
  }

  async updateSettings(prev: number, def: number, cooldown: number) {
    try {
      const newSettings = {
        umbral_preventivo: Number(prev),
        umbral_definitivo: Number(def),
        tiempo_espera_segundos: Number(cooldown)
      };
      await this.db.collection('configuracion').doc('actual').set(newSettings);
      return newSettings;
    } catch (error) {
      console.error("Error al actualizar configuraciones:", error);
      throw error;
    }
  }

  async getStatsHourly() {
    try {
      // Tomamos las últimas 500 detecciones para calcular la analítica
      const snapshot = await this.db.collection('detecciones')
        .orderBy('fecha_hora', 'desc')
        .limit(500)
        .get();

      const hoursCount = Array(24).fill(0).map((_, i) => ({
        hora: `${String(i).padStart(2, '0')}:00`,
        personas: 0,
        detecciones: 0
      }));

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.timestamp) {
          const hour = parseInt(data.timestamp.slice(11, 13));
          if (hour >= 0 && hour < 24) {
            hoursCount[hour].personas += (data.personas || 0);
            hoursCount[hour].detecciones += 1;
          }
        }
      });

      return hoursCount.map(h => ({
        hora: h.hora,
        personas: h.detecciones > 0 ? parseFloat((h.personas / h.detecciones).toFixed(1)) : 0
      }));
    } catch (error) {
      console.error("Error en stats por hora:", error);
      return [];
    }
  }

  async getStatsWeekly() {
    try {
      const snapshot = await this.db.collection('detecciones')
        .orderBy('fecha_hora', 'desc')
        .limit(500)
        .get();

      const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const weeklyCount = daysOfWeek.map(day => ({
        dia: day,
        personas: 0,
        detecciones: 0
      }));

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.fecha_hora) {
          const date = data.fecha_hora.toDate();
          const dayIndex = date.getDay();
          weeklyCount[dayIndex].personas += (data.personas || 0);
          weeklyCount[dayIndex].detecciones += 1;
        }
      });

      return weeklyCount.map(w => ({
        dia: w.dia,
        personas: w.detecciones > 0 ? parseFloat((w.personas / w.detecciones).toFixed(1)) : 0
      }));
    } catch (error) {
      console.error("Error en stats semanales:", error);
      return [];
    }
  }

  getHello(): string {
    return 'TaxiBocarchi API Backend activo!';
  }
}

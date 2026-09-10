import { Injectable } from "@angular/core";
import { Nfse } from "../../features/nfse/models/nfse";

@Injectable({
    providedIn: 'root'
})
export class NFSeDatabaseService {
    private readonly dbName = 'nfse_moduledb';
    private readonly dbVersion = 2;
    private readonly nfseStore = 'nfse';
    
    private db?: IDBDatabase;

    async abrir(): Promise<IDBDatabase> {
        if (this.db) {
            return this.db;
        }

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onupgradeneeded = () => {
                const db = request.result;
                let store: IDBObjectStore;

                if (!db.objectStoreNames.contains(this.nfseStore)) {
                    store = db.createObjectStore(this.nfseStore, { keyPath: 'id' });
                } else {
                    store = request.transaction!.objectStore(this.nfseStore);
                }

                if (!store.indexNames.contains('status')) {
                    store.createIndex('status', 'status', { unique: false });
                }
                if (!store.indexNames.contains('adn_status')) {
                    store.createIndex('adn_status', 'adn_status', { unique: false });
                }
                if (!store.indexNames.contains('dh_emi')) {
                    store.createIndex('dh_emi', 'dh_emi', { unique: false });
                }
                if (!store.indexNames.contains('prest_cpf_cnpj')) {
                    store.createIndex('prest_cpf_cnpj', 'prest_cpf_cnpj', { unique: false });
                }
                if (!store.indexNames.contains('toma_cpf_cnpj')) {
                    store.createIndex('toma_cpf_cnpj', 'toma_cpf_cnpj', { unique: false });
                }
                if (!store.indexNames.contains('chave_acesso')) {
                    store.createIndex('chave_acesso', 'chave_acesso', { unique: false });
                }
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async salvar(nfse: Nfse): Promise<void> {
        const db = await this.abrir();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.nfseStore, 'readwrite');
            const store = transaction.objectStore(this.nfseStore);

            store.put(nfse);

            transaction.oncomplete = () => {
                resolve();
            };
            transaction.onerror = () => {
                reject(transaction.error);
            };
        });
    }

    async buscar(id: string): Promise<Nfse | undefined> {
        const db = await this.abrir();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.nfseStore, 'readonly');
            const store = transaction.objectStore(this.nfseStore);

            const request = store.get(id);
            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async listar(): Promise<Nfse[]> {
        const db = await this.abrir();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.nfseStore, 'readonly');
            const store = transaction.objectStore(this.nfseStore);

            const request = store.getAll();
            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = () => {
                reject(request.error);
            }
        });
    }

    async buscarPorStatus(status: Nfse['status']): Promise<Nfse[]> {
        const db = await this.abrir();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.nfseStore, 'readonly');
            const store = transaction.objectStore(this.nfseStore);
            const index = store.index('status');

            const request = index.getAll(status);
            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async buscarPorPeriodo(dtInicial: string, dtFinal: string): Promise<Nfse[]> {
        const db = await this.abrir();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.nfseStore, 'readonly');
            const store = transaction.objectStore(this.nfseStore);
            const index = store.index('dh_emi');
            const range = IDBKeyRange.bound(dtInicial, dtFinal);

            const request = index.getAll(range);
            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = () => {
                reject(request.error);
            };
        });
    }
}

void _start(void) // loaded at 0x803ED214 (EUR), 0x803ED27C (USA), 0x803E53B4 (JAP)
{
        unsigned int* tfbl;
        unsigned int* fba; 
        int i = 0;
        while(1)
        {
                tfbl = (unsigned int*)0xCC00201C;
                fba = 0x80000000 + ((*tfbl) & 0x00FFFE00);
                fba[i] = fba[i+1]+2;
                fba[i+1] = fba[i-1]+3;
                fba[i-1] = fba[i]+4;
                i+=3;
                if (i > 0x20000) i = 1;
        }
}

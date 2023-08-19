import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountry } from '../../interfaces/country.interfaces';
import { filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: [],
})
export class SelectorPageComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private countriesService: CountriesService
  ) {}

  public myForm: FormGroup = this.fb.group({
    region: ['', [Validators.required]],
    country: ['', [Validators.required]],
    border: ['', [Validators.required]],
  });

  public countriesByRegion: SmallCountry[] = [];
  public borders: SmallCountry[] = [];

  ngOnInit(): void {
    this.onRegionChanged();
    this.onCountryChanged();
  }

  get regions(): Region[] {
    return this.countriesService.regions;
  }

  onRegionChanged(): void {
    this.myForm
      .get('region')!
      .valueChanges.pipe(
        tap(() => this.myForm.get('country')!.setValue('')), // el tap ejecuta acciones secundarias sin alterar la data
        tap(() => (this.borders = [])),
        switchMap(
          (
            region // SwitchMap recibe el valor de un observable y permite suscribirse a otro observable
          ) => this.countriesService.getCountriesByRegion(region)
        )
      )
      .subscribe((countries) => {
        this.countriesByRegion = countries;
      });
  }

  onCountryChanged(): void {
    this.myForm
      .get('country')!
      .valueChanges.pipe(
        tap(() => this.myForm.get('border')!.setValue('')),
        filter((value: string) => value.length > 0), // No permite ejecutar los demas operadores hasta que se cumpla la condición
        switchMap((alphaCode) =>
          this.countriesService.getCountryByAlphaCode(alphaCode)
        ),
        switchMap((country) =>
          this.countriesService.getCountryBordersByCode(country.borders)
        )
      )
      .subscribe((countries) => {
        console.log({ countries });
        this.borders = countries;
      });
  }
}
